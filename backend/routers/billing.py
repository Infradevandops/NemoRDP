from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.user import User
from backend.core.security import get_current_user # Need to implement this dependency
from pydantic import BaseModel

router = APIRouter(prefix="/billing", tags=["billing"])

class PaymentInitiate(BaseModel):
    plan: str
    payment_method: str # 'paystack' or 'crypto'
    crypto_type: str = None # 'BTC', 'ETH', 'USDT' (required if method is crypto)

from backend.tasks.provisioning import provision_rdp_task
import uuid

from backend.services.paystack import PaystackService

@router.post("/initiate")
async def initiate_payment(payment: PaymentInitiate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order_id = str(uuid.uuid4())
    amount_kobo = 1500 * 100 # Example: $15 -> 15000 kobo (assuming NGN or conversion, usually Paystack is NGN, let's assume 150000 kobo for N1500)
    # Note: In real app, calculate amount based on plan
    
    if payment.payment_method == "paystack":
        paystack_service = PaystackService()
        
        # Detect OS from plan string simple logic
        os_type = "windows" if "server" in payment.plan.lower() or "basic" in payment.plan.lower() else "linux"
        
        # Initialize Transaction
        response = paystack_service.initialize_transaction(
            email=current_user.email,
            amount_kobo=150000, # Mock 1500.00
            reference=order_id,
            callback_url="http://localhost:3000/dashboard?payment=success",
        )
        
        # IMPORTANT: Paystack doesn't natively support arbitrary metadata in initialize via library sometimes, 
        # but we need it for webhook. If lib fails, we fallback to dict.
        # Assuming initialize returns dict or object with 'data'
        
        # FOR DEVELOPMENT ONLY: If no key, Auto-provision
        if not paystack_service.secret_key:
             provision_rdp_task.delay(
                user_id=current_user.id,
                order_id=order_id,
                os_type_str=os_type, 
                plan=payment.plan,
                user_email=current_user.email
            )
        
        return {
            "status": "pending",
            "payment_url": response['data']['authorization_url'],
            "reference": order_id
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
