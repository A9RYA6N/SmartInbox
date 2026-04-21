"""
app/schemas/auth.py
-------------------
Pydantic schemas for authentication endpoints.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    email:    EmailStr       = Field(..., examples=["alice@example.com"])
    username: str            = Field(..., min_length=3, max_length=80, examples=["alice"])
    password: str            = Field(..., min_length=8, max_length=128)
    admin_key: str           = Field(default="", examples=[""])

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        return v

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not all(c.isalnum() or c in "_-" for c in v):
            raise ValueError("Username must be alphanumeric (underscores/hyphens allowed).")
        return v.lower()


class LoginRequest(BaseModel):
    email:    EmailStr = Field(..., examples=["alice@example.com"])
    password: str      = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"
    expires_in:    int               # seconds
    role:          str = "user"


class UserOut(BaseModel):
    id:         uuid.UUID
    email:      str
    username:   str
    role:       str
    is_active:  bool
    created_at: datetime

    model_config = {"from_attributes": True}


class RefreshRequest(BaseModel):
    refresh_token: str
