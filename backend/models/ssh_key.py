from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.connection import Base

class SSHKey(Base):
    __tablename__ = "ssh_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    public_key = Column(String, nullable=False)
    fingerprint = Column(String, nullable=True) # Optional MD5/SHA256
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="ssh_keys")
