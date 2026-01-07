from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth, billing, instances, webhooks, support, admin
from backend.database.connection import engine, Base

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

@app.get("/")
async def root():
    return {"message": "Welcome to NemoRDP API", "status": "operational"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
