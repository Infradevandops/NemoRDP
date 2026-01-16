from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from backend.database.connection import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    paystack_customer_id = Column(String, nullable=True)
    crypto_wallet_address = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    rdp_instances = relationship("RDPInstance", back_populates="user")
    tickets = relationship("Ticket", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    ssh_keys = relationship("SSHKey", back_populates="user")
