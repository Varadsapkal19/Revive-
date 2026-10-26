"""
REVIVE FastAPI Main Application Entrypoint
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api.endpoints import router as api_router
from app.services.services import SeederService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Provision tables and seed initial demo dataset
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        SeederService.seed_initial_demo_data(db)
    yield
    # Shutdown

app = FastAPI(
    title="REVIVE — Revenue Recovery Intelligence & Value Engine",
    description="Autonomous closed-loop revenue recovery intelligence layer for the Razorpay ecosystem.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API endpoints
app.include_router(api_router)
