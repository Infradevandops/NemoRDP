from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.database.connection import get_db
from backend.models.rdp_instance import RDPInstance
from backend.core.security import get_current_user
from backend.models.user import User
from pydantic import BaseModel
from datetime import datetime

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

from backend.services.provisioning import ProvisioningService
from fastapi import HTTPException

@router.post("/{instance_id}/reboot")
async def reboot_instance(
    instance_id: int,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    instance = db.query(RDPInstance).filter(RDPInstance.id == instance_id, RDPInstance.user_id == current_user.id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
        
    service = ProvisioningService()
    # In a real app we might want to check if provider_id is valid
    success = await service.reboot_rdp(instance.provider, instance.provider_id)
    if not success:
         raise HTTPException(status_code=500, detail="Failed to reboot instance")
         
    return {"status": "rebooting"}

@router.delete("/{instance_id}")
async def terminate_instance(
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
