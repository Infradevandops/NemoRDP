from celery import shared_task
import asyncio
from asgiref.sync import async_to_sync
from backend.services.provisioning import ProvisioningService, OSType
from backend.models.rdp_instance import RDPInstance
from backend.database.connection import SessionLocal
from backend.services.email import EmailService # We'll create this next

@shared_task(bind=True, max_retries=3)
def provision_rdp_task(self, user_id: int, order_id: str, os_type_str: str, plan: str, user_email: str):
    """Background task to provision RDP instance"""
    db = SessionLocal()
    provisioning_service = ProvisioningService()
    email_service = EmailService()
    
    try:
        # Convert string back to Enum
        os_type = OSType(os_type_str)
        
        # 1. Create Initial DB Record
        rdp_instance = RDPInstance(
            user_id=user_id,
            provider="vultr" if os_type == OSType.WINDOWS else "contabo",
            provider_id="pending",
            os_type=os_type_str,
            plan=plan,
            status="provisioning"
        )
        db.add(rdp_instance)
        db.commit()
        db.refresh(rdp_instance)
        
        # 2. Call Provisioning Service (Async in sync context)
        # We use async_to_sync because Celery tasks are typically sync wrappers
        result = async_to_sync(provisioning_service.provision_rdp)(
            order_id, 
            os_type, 
            plan
        )
        
        # 3. Update DB with Credentials
        rdp_instance.provider_id = result["provider_id"]
        rdp_instance.ip_address = result["ip_address"]
        rdp_instance.username = result["username"]
        rdp_instance.password = result["password"]
        rdp_instance.status = result["status"]
        db.commit()
        
        # 4. Send Email
        async_to_sync(email_service.send_rdp_credentials)(
            user_email,
            result,
            os_type_str
        )
        print(f"Provisioning successful for {order_id}. Credentials: {result}")
        
        return {"status": "success", "instance_id": rdp_instance.id}
        
    except Exception as e:
        # Update status to failed
        if 'rdp_instance' in locals():
            rdp_instance.status = "failed"
            db.commit()
        
        # Retry logic
        try:
            self.retry(countdown=60 * (2 ** self.request.retries))
        except MaxRetriesExceededError:
            print(f"Max retries exceeded for {order_id}")
            raise e
        raise e
    finally:
        db.close()
