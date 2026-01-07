from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from backend.database.connection import Base
from datetime import datetime

class RDPInstance(Base):
    __tablename__ = "rdp_instances"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider = Column(String, nullable=False)  # 'vultr' or 'contabo'
    provider_id = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)
    os_type = Column(String, nullable=False)  # 'windows' or 'linux'
    plan = Column(String, nullable=False)  # 'basic', 'performance'
    status = Column(String, default="provisioning")
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
