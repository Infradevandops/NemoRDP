from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.routers import auth, billing, instances, webhooks, support, admin
from backend.database.connection import engine, Base, get_db
from backend.models.payment import Payment # Ensure table creation

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NemoRDP API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(billing.router)
app.include_router(instances.router)
app.include_router(webhooks.router)
app.include_router(support.router)
app.include_router(admin.router)

# Rate Limiting
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from backend.core.ratelimit import limiter

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Enterprise Hardening
from backend.middleware.error_handler import ErrorHandlerMiddleware
from backend.core.logger import logging_dependency
from starlette.middleware.base import BaseHTTPMiddleware
import uuid

# Add Request ID Middleware (Simple implementation inline for now)
class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.headers.__dict__["_list"].append(
            (b"x-request-id", request_id.encode())
        )
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(RequestIDMiddleware)

@app.get("/")
async def root():
    return {"message": "Welcome to NemoRDP API", "status": "operational"}

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    health = {"status": "healthy", "services": {}}
    
    # Check Database
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        health["services"]["database"] = "up"
    except Exception as e:
        health["services"]["database"] = f"down: {str(e)}"
        health["status"] = "degraded"
        
    # Check Redis (Optional)
    try:
        import redis
        from backend.core.celery_app import REDIS_URL
        r = redis.from_url(REDIS_URL, socket_connect_timeout=1)
        r.ping()
        health["services"]["redis"] = "up"
    except Exception as e:
        health["services"]["redis"] = f"down: {str(e)}"
        # Redis failure might not mean the app is down, but degraded
        
    return health
