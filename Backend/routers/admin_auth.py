"""
app/routers/admin_auth.py
-------------------------
Authentication router for Administrators.
"""

from fastapi import APIRouter, status

from app.auth.dependencies import CurrentUser, DBSession, AdminUser
from app.schemas.auth import AdminRegisterRequest, LoginRequest, RefreshRequest, TokenResponse, UserOut
from app.services.auth_service import login_admin, refresh_access_token, register_admin

router = APIRouter(tags=["Admin Authentication"])


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new admin account",
)
async def register(req: AdminRegisterRequest, db: DBSession) -> UserOut:
    """
    Create a new admin account. Requires a valid **admin_key**.
    """
    user = await register_admin(db, req)
    return UserOut.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Admin Login",
)
async def login(req: LoginRequest, db: DBSession) -> TokenResponse:
    """
    Authenticate an admin and receive JWT tokens.
    Only users with role='admin' can log in here.
    """
    return await login_admin(db, req)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh Admin Access Token",
)
async def refresh(req: RefreshRequest, db: DBSession) -> TokenResponse:
    """
    Exchange a valid refresh token for a new pair of tokens.
    """
    return await refresh_access_token(db, req.refresh_token)


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get current admin profile",
)
async def get_me(admin: AdminUser) -> UserOut:
    """Return the profile of the currently authenticated admin."""
    return UserOut.model_validate(admin)
