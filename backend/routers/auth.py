from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.models.user import User
from backend.core import security
from backend.core.config import settings
from pydantic import BaseModel, EmailStr
from backend.core.ratelimit import limiter
from backend.services.email import EmailService

router = APIRouter(prefix="/auth", tags=["authentication"])

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=Token)
@limiter.limit("5/minute")
def register(request: Request, user_in: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Send Verification Email (Background)
    try:
        token = security.create_verification_token(user.email)
        email_service = EmailService()
        background_tasks.add_task(email_service.send_verification_email, user.email, token)
    except Exception as e:
        print(f"Failed to queue verify email: {e}")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, body: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if user:
        # Generate token
        token = security.create_password_reset_token(user.email)
        # Send email (async)
        email_service = EmailService()
        await email_service.send_password_reset_email(user.email, token)
    
    # Always return success to prevent email enumeration
    return {"message": "If this email is registered, you will receive a password reset link."}

@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, body: PasswordResetConfirm, db: Session = Depends(get_db)):
    email = security.verify_password_reset_token(body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = security.get_password_hash(body.new_password)
    db.commit()
    
@router.post("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    email = security.verify_email_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.is_verified:
         return {"message": "Email already verified"}

    user.is_verified = True
    db.commit()
    
    return {"message": "Email verified successfully"}
