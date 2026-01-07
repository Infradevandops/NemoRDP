from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database.connection import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="open") # open, answered, closed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="tickets")

# Update User model to include relation (we can do this loosely or update User model file)
# For now, let's assume we might need to update User model if we want back_populates to work perfectly, 
# but often it's not strictly required unless we access user.tickets.
