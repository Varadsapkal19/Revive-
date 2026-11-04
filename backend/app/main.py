"""
REVIVE FastAPI Main Application Entrypoint
Enterprise-hardened with Security Headers, CORS isolation, and Lifespan Table Provisioning.
"""

import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api.endpoints import router as api_router
from app.services.services import SeederService

MAX_REQUEST_BODY_SIZE = 2 * 1024 * 1024  # 2MB

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Provision tables and seed initial demo dataset
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        SeederService.seed_initial_demo_data(db)
    yield
    # Shutdown

docs_url = None if (settings.ENVIRONMENT == "production" and not settings.DEBUG) else "/docs"
redoc_url = None if (settings.ENVIRONMENT == "production" and not settings.DEBUG) else "/redoc"

app = FastAPI(
    title="REVIVE — Autonomous Revenue Intelligence Engine",
    description="Enterprise AI-powered closed-loop payment failure recovery and financial operations platform.",
    version="1.0.0",
    docs_url=docs_url,
    redoc_url=redoc_url,
    lifespan=lifespan
)

# 1. Native HTTP Security Middleware (OWASP Security Headers & Correlation ID)
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    correlation_id = request.headers.get("x-correlation-id") or str(uuid.uuid4())
    
    # Enforce request body size limit
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > MAX_REQUEST_BODY_SIZE:
                return JSONResponse(
                    status_code=413,
                    content={"error": "Payload Too Large", "detail": "Request body exceeds maximum size of 2MB."}
                )
        except ValueError:
            pass

    response = await call_next(request)
    
    # Inject OWASP Security Headers
    response.headers["X-Correlation-ID"] = correlation_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=(), payment=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "frame-ancestors 'none';"
    )
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    
    return response

# 2. Hardened CORS Configuration
cors_origins = [
    settings.FRONTEND_URL,
    "https://revive-plum.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https:\/\/.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Correlation-ID", "Content-Disposition"]
)

# 3. Mount API Endpoints
app.include_router(api_router)
