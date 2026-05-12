"""
app/routers/admin_auth.py
-------------------------
Dedicated authentication router for administrators.
Enforces role=admin checks during login and provides specific admin session tokens.
"""

from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.auth.dependencies import DBSession
from app.auth.jwt_handler import create_access_token, create_refresh_token
from app.auth.password import verify_password
from app.core.logging import get_logger
from app.models.user import User, UserRole

router = APIRouter(prefix="/auth/admin", tags=["Admin Authentication"])
logger = get_logger("router.admin_auth")


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    summary="[Admin] Dedicated admin login – validates role=admin",
)
async def admin_login(
    req: Dict[str, str],
    db:  DBSession,
) -> Dict[str, Any]:
    """
    Admin-specific login that:
    - Validates email + password
    - Ensures role == 'admin'
    - Issues JWT with sub=admin_id, role='admin'
    - Returns access + refresh tokens
    """
    email    = req.get("email", "").strip().lower()
    password = req.get("password", "")

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="email and password are required.",
        )

    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: admin role required.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is deactivated.",
        )

    # Issue tokens
    access_token  = create_access_token(str(user.id), role="admin")
    refresh_token = create_refresh_token(str(user.id))

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    logger.info("Admin login │ email=%s │ id=%s", user.email, user.id)

    return {
        "access_token":  access_token,
        "refresh_token": refresh_token,
        "token_type":    "bearer",
        "role":          "admin",
    }
