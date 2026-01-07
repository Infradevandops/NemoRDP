from celery import Celery
import os

# Use Redis as broker and result backend
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "nemordp",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

# Auto-discover tasks
celery_app.autodiscover_tasks(['backend.tasks'])

# Beat Schedule
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    'check-expired-instances-every-hour': {
        'task': 'backend.tasks.expiry.check_expired_instances',
        'schedule': crontab(minute=0), # Run every hour
    },
}
