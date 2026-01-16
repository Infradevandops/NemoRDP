from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.user import User
from backend.models.payment import Payment
from backend.core.security import get_current_user # Need to implement this dependency
from pydantic import BaseModel

router = APIRouter(prefix="/billing", tags=["billing"])

class PaymentInitiate(BaseModel):
    plan: str  # 'basic' or 'pro'
    duration: str  # 'hourly', 'weekly', 'monthly'
    hours: int = None  # Required if duration='hourly', minimum 2
    payment_method: str # 'paystack' or 'crypto'
    crypto_type: str = None # 'BTC', 'ETH', 'USDT' (required if method is crypto)
    os_type: str = "windows" # 'windows' or 'linux'
    location: str = "US" # 'US', 'EU', 'ASIA'

from backend.tasks.provisioning import provision_rdp_task
import uuid
from datetime import datetime, timedelta

from backend.services.paystack import PaystackService

# Pricing matrix (USD)
PRICING = {
    ("basic", "hourly"): 0.75,   # per hour
    ("basic", "weekly"): 8.00,   # 7 days
    ("basic", "monthly"): 15.00, # 30 days
    ("pro", "hourly"): 1.25,     # per hour
    ("pro", "weekly"): 12.00,    # 7 days
    ("pro", "monthly"): 25.00,   # 30 days
}

# Duration in days
DURATION_DAYS = {
    "weekly": 7,
    "monthly": 30,
}

@router.get("/")
async def get_billing_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payments = db.query(Payment).filter(Payment.user_id == current_user.id).order_by(Payment.created_at.desc()).all()
    return payments

@router.post("/initiate")
async def initiate_payment(payment: PaymentInitiate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_verified:
        raise HTTPException(
            status_code=403, 
            detail="Please verify your email address to deploy a server."
        )

    order_id = str(uuid.uuid4())
    
    # Validate hourly purchase
    if payment.duration == "hourly":
        if not payment.hours or payment.hours < 2:
            raise HTTPException(status_code=400, detail="Minimum 2 hours required for hourly plans")
        if payment.hours > 720:  # 30 days max
            raise HTTPException(status_code=400, detail="Maximum 720 hours (30 days)")
    
    # Calculate amount
    price_key = (payment.plan, payment.duration)
    if price_key not in PRICING:
        raise HTTPException(status_code=400, detail=f"Invalid plan/duration combination: {payment.plan}/{payment.duration}")
    
    if payment.duration == "hourly":
        amount_usd = PRICING[price_key] * payment.hours
        duration_days = payment.hours / 24.0  # Convert hours to fractional days
    else:
        amount_usd = PRICING[price_key]
        duration_days = DURATION_DAYS[payment.duration]
    
    # Convert to kobo (mock rate: 1 USD = 1000 NGN)
    amount_kobo = int(amount_usd * 1000 * 100)

    # Create Payment Record
    db_payment = Payment(
        user_id=current_user.id,
        amount=amount_usd,
        currency="USD",
        status="pending",
        provider=payment.payment_method,
        reference=order_id,
        description=f"{payment.plan.title()} Plan - {payment.duration}"
    )
    db.add(db_payment)
    db.commit()
    
    if payment.payment_method == "paystack":
        paystack_service = PaystackService()
        
        # Initialize Transaction
        response = paystack_service.initialize_transaction(
            email=current_user.email,
            amount_kobo=amount_kobo,
            reference=order_id,
            callback_url="http://localhost:3000/dashboard?payment=success",
        )
        
        # FOR DEVELOPMENT ONLY: If no key, Auto-provision
        if not paystack_service.secret_key:
             # Auto-mark payment as success for dev
             db_payment.status = "success"
             db.commit()

             provision_rdp_task.delay(
                user_id=current_user.id,
                order_id=order_id,
                os_type_str=payment.os_type, 
                plan=payment.plan,
                user_email=current_user.email,
                location=payment.location,
                duration_days=duration_days
            )
        
        return {
            "status": "pending",
            "payment_url": response['data']['authorization_url'],
            "reference": order_id,
            "amount": amount_usd,
            "duration": f"{payment.hours} hours" if payment.duration == "hourly" else payment.duration
        }
    elif payment.payment_method == "crypto":
        if not payment.crypto_type:
             raise HTTPException(status_code=400, detail="Crypto type is required for crypto payments")
        
        # Mock Address
        mock_addresses = {
            "BTC": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
            "ETH": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
            "USDT": "TVc2C1iP9A6d7F3b3b3b3b3b3b3b3b3b3b"
        }
        
        return {
            "status": "pending",
            "wallet_address": mock_addresses.get(payment.crypto_type, "Invalid Crypto Type"),
            "amount": 0.001, # Mock amount
            "currency": payment.crypto_type,
             "order_id": order_id
        }
    
    raise HTTPException(status_code=400, detail="Invalid payment method")

@router.post("/webhook/paystack")
async def paystack_webhook(request: Request):
    # Handle webhook
    return {"status": "received"}
