from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.services.paystack import PaystackService
from backend.models.rdp_instance import RDPInstance
from backend.tasks.provisioning import provision_rdp_task
from backend.models.user import User
import json

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/paystack")
async def paystack_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Paystack Webhooks"""
    paystack_service = PaystackService()
    
    # 1. Verify Signature
    signature = request.headers.get("x-paystack-signature")
    if not signature:
         # In dev/mock, we might not have headers, but for real prod we need it
         if paystack_service.secret_key:
            raise HTTPException(status_code=400, detail="No signature header")
    
    body_bytes = await request.body()
    if not paystack_service.verify_webhook_signature(signature or "", body_bytes):
         raise HTTPException(status_code=400, detail="Invalid signature")

    event = await request.json()
    
    # 2. Process Event
    if event["event"] == "charge.success":
        data = event["data"]
        reference = data["reference"]
        email = data["customer"]["email"]
        
        # In the metadata (passed during init), we should have stored user_id and plan
        # If not in metadata, we have to look up via reference if we stored a "Transaction" record.
        # For this MVP, we will rely on metadata if we send it, or use the reference which we set as order_id.
        
        # Extract metadata
        metadata = data.get("metadata", {})
        user_id = metadata.get("user_id")
        plan = metadata.get("plan")
        os_type_str = metadata.get("os_type")
        
        if user_id and plan:
            print(f"Payment successful for reference: {reference}. Triggering Provisioning.")
            
            # Idempotency check: Check if instance already exists/provisioning for this order_id
            existing = db.query(RDPInstance).filter(RDPInstance.provider_id == reference).first()
            if existing:
                return {"status": "already_processed"}

            # Trigger Task
            provision_rdp_task.delay(
                user_id=user_id,
                order_id=reference,
                os_type_str=os_type_str or "linux",
                plan=plan,
                user_email=email
            )
            
    return {"status": "received"}
