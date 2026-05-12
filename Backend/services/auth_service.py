"""
app/services/auth_service.py
-----------------------------
Business logic for user registration, login, and token refresh.
"""

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt_handler import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.auth.password import hash_password, verify_password
from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.user import User, UserRole
from app.schemas.auth import AdminRegisterRequest, LoginRequest, UserRegisterRequest, TokenResponse

settings = get_settings()
logger = get_logger(__name__)
ADMIN_SETUP_KEY = "SmartInbox@Admin2026"  # change this in production via ADMIN_SETUP_KEY env var


async def register_user(db: AsyncSession, req: UserRegisterRequest) -> User:
    """
    Register a new standard user.
    """
    email_clean = req.email.lower().strip()
    
    # Uniqueness checks
    existing = (await db.execute(select(User).where((User.email == email_clean) | (User.username == req.username)))).scalars().first()
    if existing:
        raise HTTPException(status_code=409, detail="Email or username already taken.")

    user = User(
        email           = email_clean,
        username        = req.username,
        hashed_password = hash_password(req.password),
        role            = UserRole.user,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    logger.info("New USER registered │ id=%s │ email=%s", user.id, user.email)
    return user


async def register_admin(db: AsyncSession, req: AdminRegisterRequest) -> User:
    """
    Register a new administrator, requiring the ADMIN_SETUP_KEY.
    """
    if req.admin_key != ADMIN_SETUP_KEY:
        logger.warning("Admin registration failed: Invalid setup key │ email=%s", req.email)
        raise HTTPException(status_code=403, detail="Invalid admin setup key.")

    email_clean = req.email.lower().strip()
    
    # Check if user already exists (upgrade or conflict)
    existing = (await db.execute(select(User).where(User.email == email_clean))).scalar_one_or_none()
    if existing:
        if existing.role == UserRole.admin:
            raise HTTPException(status_code=409, detail="Admin account already exists.")
        # Upgrade existing user to admin
        existing.role = UserRole.admin
        await db.commit()
        await db.refresh(existing)
        logger.info("User upgraded to ADMIN │ id=%s │ email=%s", existing.id, existing.email)
        return existing

    # Create new admin
    user = User(
        email           = email_clean,
        username        = req.username,
        hashed_password = hash_password(req.password),
        role            = UserRole.admin,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    logger.info("New ADMIN registered │ id=%s │ email=%s", user.id, user.email)
    return user


async def login_user(db: AsyncSession, req: LoginRequest) -> TokenResponse:
    """
    Authenticate a standard user.
    """
    user = await _authenticate(db, req)
    
    # Strictly block admins from user login to enforce domain separation
    if user.role == UserRole.admin:
        logger.warning("Admin login attempt blocked at User portal │ email=%s", user.email)
        raise HTTPException(
            status_code=403, 
            detail="Administrators must use the dedicated Admin Portal to log in."
        )

    return await _mint_tokens(db, user)


async def login_admin(db: AsyncSession, req: LoginRequest) -> TokenResponse:
    """
    Authenticate an administrator. Strictly enforces role=admin.
    """
    user = await _authenticate(db, req)
    
    if user.role != UserRole.admin:
        logger.warning("Admin login blocked: User does not have admin role │ email=%s", user.email)
        raise HTTPException(status_code=403, detail="Access denied: Admin role required.")

    return await _mint_tokens(db, user)


async def _authenticate(db: AsyncSession, req: LoginRequest) -> User:
    email_clean = req.email.lower().strip()
    user = (await db.execute(select(User).where(User.email == email_clean))).scalar_one_or_none()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated.")
    
    return user


async def _mint_tokens(db: AsyncSession, user: User) -> TokenResponse:
    access_token  = create_access_token(subject=str(user.id), role=user.role.value)
    refresh_token = create_refresh_token(subject=str(user.id))

    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    logger.info("%s logged in │ id=%s", user.role.value.upper(), user.id)
    return TokenResponse(
        access_token  = access_token,
        refresh_token = refresh_token,
        expires_in    = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        role          = user.role.value,
    )


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> TokenResponse:
    """
    Validate refresh token and mint a new access token.

    Raises HTTP 401 on invalid or expired refresh token.
    """
    from jose import JWTError

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_refresh_token(refresh_token)
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = (
        await db.execute(select(User).where(User.id == user_id))
    ).scalar_one_or_none()

    if not user or not user.is_active:
        raise credentials_exception

    access_token  = create_access_token(subject=str(user.id), role=user.role.value)
    new_refresh   = create_refresh_token(subject=str(user.id))

    return TokenResponse(
        access_token  = access_token,
        refresh_token = new_refresh,
        expires_in    = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        role          = user.role.value,
    )
