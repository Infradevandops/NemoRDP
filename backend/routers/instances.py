from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from backend.database.connection import get_db
from backend.models.rdp_instance import RDPInstance
from backend.core.security import get_current_user
from backend.models.user import User
from pydantic import BaseModel
from datetime import datetime, timedelta
from backend.services.provisioning import ProvisioningService
from backend.core.ratelimit import limiter

router = APIRouter(prefix="/instances", tags=["instances"])

class RDPInstanceSchema(BaseModel):
    id: int
    provider_id: str
    ip_address: str | None
    username: str | None
    password: str | None
    os_type: str
    plan: str
    status: str
    created_at: datetime
    expires_at: datetime | None
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[RDPInstanceSchema])
async def get_my_instances(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Get all instances for current user"""
    instances = db.query(RDPInstance).filter(RDPInstance.user_id == current_user.id).all()
    return instances

@router.post("/{instance_id}/reboot")
@limiter.limit("3/minute")
async def reboot_instance(
    request: Request,
    instance_id: int,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    instance = db.query(RDPInstance).filter(RDPInstance.id == instance_id, RDPInstance.user_id == current_user.id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
        
    service = ProvisioningService()
    success = await service.reboot_rdp(instance.provider, instance.provider_id)
    if not success:
         raise HTTPException(status_code=500, detail="Failed to reboot instance")
         
    return {"status": "rebooting"}

@router.delete("/{instance_id}")
@limiter.limit("2/minute")
async def terminate_instance(
    request: Request,
    instance_id: int,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    instance = db.query(RDPInstance).filter(RDPInstance.id == instance_id, RDPInstance.user_id == current_user.id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
        
    service = ProvisioningService()
    success = await service.terminate_rdp(instance.provider, instance.provider_id)
    
    if success:
        instance.status = "terminated"
        db.commit()
        return {"status": "terminated"}
    
    raise HTTPException(status_code=500, detail="Failed to terminate instance")

class ExtendRequest(BaseModel):
    days: int  # 7, 14, or 30

@router.post("/{instance_id}/extend")
@limiter.limit("5/minute")
async def extend_instance(
    request: Request,
    instance_id: int,
    extend_req: ExtendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Extend instance expiry by adding days"""
    # Validate days
    if extend_req.days not in [7, 14, 30]:
        raise HTTPException(status_code=400, detail="Days must be 7, 14, or 30")
    
    # Get instance
    instance = db.query(RDPInstance).filter(
        RDPInstance.id == instance_id,
        RDPInstance.user_id == current_user.id
    ).first()
    
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    if instance.status == "terminated":
        raise HTTPException(status_code=400, detail="Cannot extend terminated instance")
    
    # Calculate new expiry (from current expiry or now, whichever is later)
    base_time = max(instance.expires_at or datetime.utcnow(), datetime.utcnow())
    new_expiry = base_time + timedelta(days=extend_req.days)
    
    # Update instance
    instance.expires_at = new_expiry
    db.commit()
    db.refresh(instance)
    
    return {
        "message": f"Instance extended by {extend_req.days} days",
        "new_expiry": new_expiry.isoformat(),
        "instance_id": instance_id
    }
