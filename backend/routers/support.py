from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from backend.database.connection import get_db
from backend.models.ticket import Ticket
from backend.models.user import User
from backend.core.security import get_current_user

router = APIRouter(prefix="/support", tags=["support"])

class TicketCreate(BaseModel):
    subject: str
    message: str

class TicketResponse(BaseModel):
    id: int
    subject: str
    message: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/tickets", response_model=TicketResponse)
async def create_ticket(
    ticket: TicketCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    new_ticket = Ticket(
        user_id=current_user.id,
        subject=ticket.subject,
        message=ticket.message
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket

@router.get("/tickets", response_model=List[TicketResponse])
async def get_tickets(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return db.query(Ticket).filter(Ticket.user_id == current_user.id).order_by(Ticket.created_at.desc()).all()
