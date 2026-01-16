from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from backend.database.connection import get_db
from backend.models.user import User
from backend.models.ssh_key import SSHKey
from backend.core.security import get_current_user

router = APIRouter(prefix="/ssh-keys", tags=["ssh-keys"])

class SSHKeyCreate(BaseModel):
    name: str
    public_key: str

class SSHKeyResponse(BaseModel):
    id: int
    name: str
    public_key: str
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[SSHKeyResponse])
async def get_my_keys(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    return db.query(SSHKey).filter(SSHKey.user_id == current_user.id).all()

@router.post("/", response_model=SSHKeyResponse)
async def add_ssh_key(
    key_in: SSHKeyCreate,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Validate key format (Simple check)
    if not key_in.public_key.strip().startswith("ssh-"):
        raise HTTPException(status_code=400, detail="Invalid SSH public key format")
        
    # Check duplicate
    existing = db.query(SSHKey).filter(SSHKey.user_id == current_user.id, SSHKey.name == key_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Key with this name already exists")

    new_key = SSHKey(
        user_id=current_user.id,
        name=key_in.name,
        public_key=key_in.public_key
    )
    db.add(new_key)
    db.commit()
    db.refresh(new_key)
    return new_key

@router.delete("/{key_id}")
async def delete_ssh_key(
    key_id: int,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    key = db.query(SSHKey).filter(SSHKey.id == key_id, SSHKey.user_id == current_user.id).first()
    if not key:
        raise HTTPException(status_code=404, detail="SSH Key not found")
        
    db.delete(key)
    db.commit()
    return {"status": "deleted"}
