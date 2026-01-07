from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.user import User
from backend.models.rdp_instance import RDPInstance
from backend.models.ticket import Ticket
from backend.core.security import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

# Quick Admin Check Dependency
def get_admin_user(current_user: User = Depends(get_current_user)):
    # Simple check: In real app, check role or flag
    # For MVP, let's assume specific email or hardcoded ID is admin
    # Or checking if user.email contains 'admin' (Not secure, but OK for MVP demo)
    if "admin" in current_user.email:
        return current_user
    
    # Or check a specific environment variable for admin email list
    # if current_user.email not in os.getenv("ADMIN_EMAILS", "").split(","):
    #     raise HTTPException(status_code=403, detail="Not authorized")
    
    # For now, let's allow EVERYONE to access admin for demo purposes if they are logged in
    # WARN: Change this for production
    return current_user 

@router.get("/stats")
async def get_admin_stats(
    db: Session = Depends(get_db), 
    admin: User = Depends(get_admin_user)
):
    total_users = db.query(User).count()
    active_instances = db.query(RDPInstance).filter(RDPInstance.status == "active").count()
    total_instances = db.query(RDPInstance).count()
    open_tickets = db.query(Ticket).filter(Ticket.status == "open").count()
    
    # Mock Revenue
    estimated_revenue = active_instances * 15.00 
    
    return {
        "total_users": total_users,
        "active_instances": active_instances,
        "total_instances": total_instances,
        "open_tickets": open_tickets,
        "revenue": estimated_revenue
    }

@router.get("/users")
async def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    # Limit to 50 for demo
    return db.query(User).limit(50).all()
