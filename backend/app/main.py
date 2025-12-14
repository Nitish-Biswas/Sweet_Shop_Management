"""
Main application entry point for Sweet Shop Management System.
Initializes FastAPI app with all routes and middleware.
"""

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.core.exceptions import SweetShopException, DuplicateResourceException
from app.routers import auth, sweets
from contextlib import asynccontextmanager



@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


# Create FastAPI app
app = FastAPI(
    lifespan = lifespan,
    title=settings.app_name,
    version=settings.app_version,
    description="A professional Sweet Shop Management System with TDD approach"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.exception_handler(SweetShopException)
async def sweet_shop_exception_handler(request: Request, exc: SweetShopException):
    """Handle custom application exceptions."""
    status_code = status.HTTP_400_BAD_REQUEST
    
    if exc.__class__.__name__ == "AuthenticationException":
        status_code = status.HTTP_401_UNAUTHORIZED
    elif exc.__class__.__name__ == "AuthorizationException":
        status_code = status.HTTP_403_FORBIDDEN
    elif exc.__class__.__name__ == "ResourceNotFoundException":
        status_code = status.HTTP_404_NOT_FOUND
    
    return JSONResponse(
        status_code=status_code,
        content={"detail": str(exc)}
    )

# Include routers
app.include_router(auth.router)
app.include_router(sweets.router)

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "version": settings.app_version}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)