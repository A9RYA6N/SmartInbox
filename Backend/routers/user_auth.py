"""
app/routers/auth.py
--------------------
Authentication router: register, login, refresh, me.
"""

from fastapi import APIRouter, status

from app.auth.dependencies import CurrentUser, DBSession
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse, UserOut
from app.services.auth_service import login_user, refresh_access_token, register_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(req: RegisterRequest, db: DBSession) -> UserOut:
    """
    Create a new user account with the given email, username, and password.

    - **email**: must be unique across all users
    - **username**: 3-80 chars, alphanumeric + underscores/hyphens
    - **password**: min 8 chars, must contain uppercase + digit
    """
    user = await register_user(db, req)
    return UserOut.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and obtain JWT tokens",
)
async def login(req: LoginRequest, db: DBSession) -> TokenResponse:
    """
    Authenticate with email + password and receive:
    - **access_token**: short-lived (60 min) – send as `Bearer` header
    - **refresh_token**: long-lived (7 days) – use to get a new access token
    """
    return await login_user(db, req)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Obtain a new access token via refresh token",
)
async def refresh(req: RefreshRequest, db: DBSession) -> TokenResponse:
    """
    Exchange a valid **refresh_token** for a new pair of tokens.
    The old refresh token is invalidated (rotation).
    """
    return await refresh_access_token(db, req.refresh_token)


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get current authenticated user's profile",
)
async def get_me(current_user: CurrentUser) -> UserOut:
    """Return the profile of the currently authenticated user."""
    return UserOut.model_validate(current_user)
