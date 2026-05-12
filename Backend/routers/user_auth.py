"""
app/routers/user_auth.py
------------------------
Authentication router for standard Users.
"""

from fastapi import APIRouter, status

from app.auth.dependencies import CurrentUser, DBSession
from app.schemas.auth import LoginRequest, RefreshRequest, UserRegisterRequest, TokenResponse, UserOut
from app.services.auth_service import login_user, refresh_access_token, register_user

router = APIRouter(prefix="/auth/user", tags=["User Authentication"])


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(req: UserRegisterRequest, db: DBSession) -> UserOut:
    """
    Create a new user account with the given email, username, and password.
    """
    user = await register_user(db, req)
    return UserOut.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="User Login",
)
async def login(req: LoginRequest, db: DBSession) -> TokenResponse:
    """
    Authenticate a standard user and receive JWT tokens.
    """
    return await login_user(db, req)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh User Access Token",
)
async def refresh(req: RefreshRequest, db: DBSession) -> TokenResponse:
    """
    Exchange a valid refresh token for a new pair of tokens.
    """
    return await refresh_access_token(db, req.refresh_token)


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get current user profile",
)
async def get_me(current_user: CurrentUser) -> UserOut:
    """Return the profile of the currently authenticated user."""
    return UserOut.model_validate(current_user)
