from .auth import router as auth_router
from .oauth import router as oauth_router
from .applications import router as applications_router

__all__ = ["auth_router", "oauth_router", "applications_router"]
