"""FastAPI application entry point with security middleware and Swagger docs."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.routers import upload

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    logger.info("🚀 Sales Insight Automator starting up...")
    logger.info(f"   CORS origins: {settings.CORS_ORIGINS}")
    logger.info(f"   API Key required: {bool(settings.API_KEY)}")
    logger.info(f"   Gemini configured: {bool(settings.GEMINI_API_KEY)}")
    logger.info(f"   SMTP configured: {bool(settings.SMTP_USER)}")
    yield
    logger.info("👋 Sales Insight Automator shutting down...")


app = FastAPI(
    title="Rabbitt AI — Sales Insight Automator Pro",
    description=(
        "Upload sales data (CSV/XLSX) and receive an AI-generated executive summary "
        "delivered directly to your inbox.\n\n"
        "## Features\n"
        "- 📂 File upload with validation (CSV, XLSX, max 10 MB)\n"
        "- 🤖 AI-powered analysis using Google Gemini\n"
        "- 📧 Professional email delivery\n"
        "- 🔒 Secured with API key authentication and rate limiting\n\n"
        "## Authentication\n"
        "If an API key is configured, include it in the `X-API-Key` header."
    ),
    version="1.0.1",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
    contact={
        "name": "Rabbitt AI Engineering",
        "email": "engineering@rabbitt.ai",
    },
    license_info={
        "name": "MIT",
    },
)

# State for rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# GZip compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"},
    )


# Health check
# API Health check endpoint
@app.get(
    "/health",
    tags=["System"],
    summary="Health Check",
    description="Returns the health status of the API and its configuration.",
)
async def health_check():
    """Check service health and configuration status."""
    return {
        "status": "healthy",
        "service": "Sales Insight Automator",
        "version": "1.0.0",
        "config": {
            "gemini_configured": bool(settings.GEMINI_API_KEY),
            "smtp_configured": bool(settings.SMTP_USER and settings.SMTP_PASSWORD),
            "api_key_required": bool(settings.API_KEY),
        },
    }


# Include routers
app.include_router(upload.router)
