"""Security middleware: API key auth, rate limiting, file validation."""

import os
from fastapi import HTTPException, Security, UploadFile, status
from fastapi.security import APIKeyHeader
from app.config import settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(api_key: str = Security(api_key_header)) -> str:
    """Validate API key from request header. Skip if no API_KEY is configured."""
    # Check if a real custom API key requires validation
    configured_key = settings.API_KEY.strip() if settings.API_KEY else ""
    
    # If it's empty or the default template from .env.example, disable auth
    if not configured_key or configured_key == "your_secret_api_key_here":
        return "no-auth"
        
    # If a real key is configured, validate the incoming request
    if not api_key or api_key != configured_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
    return api_key


def validate_file(file: UploadFile) -> None:
    """Validate uploaded file: extension and size."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided",
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )


async def validate_file_size(file: UploadFile) -> bytes:
    """Read file contents and validate size limit."""
    contents = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE_MB} MB",
        )
    return contents
