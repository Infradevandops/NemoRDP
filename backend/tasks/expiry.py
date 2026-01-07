from celery import shared_task
from datetime import datetime
from backend.database.connection import SessionLocal
from backend.models.rdp_instance import RDPInstance
from backend.services.provisioning import ProvisioningService
from asgiref.sync import async_to_sync

@shared_task(bind=True)
def check_expired_instances(self):
    """Check for expired instances and terminate them"""
    db = SessionLocal()
    provisioning_service = ProvisioningService()
    
    try:
        now = datetime.utcnow()
        expired_instances = db.query(RDPInstance).filter(
            RDPInstance.expires_at < now,
            RDPInstance.status == "active"
        ).all()
        
        print(f"Found {len(expired_instances)} expired instances.")
        
        for instance in expired_instances:
            try:
                # Terminate via Provider
                success = async_to_sync(provisioning_service.terminate_rdp)(
                    instance.provider, 
                    instance.provider_id
                )
                
                if success:
                    instance.status = "terminated"
                    print(f"Terminated expired instance {instance.id}")
                else:
                    print(f"Failed to terminate expired instance {instance.id}")
                    
            except Exception as e:
                print(f"Error terminating instance {instance.id}: {e}")
                
        db.commit()
    finally:
        db.close()
