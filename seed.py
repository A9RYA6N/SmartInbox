"""
seed.py  — SmartInbox database seeder
Seeds the admin user (idempotent: updates if exists, skips if already set up).
Works with asyncpg (Neon) by converting the asyncpg URL to a sync psycopg2 URL.
"""
import re
import os
import asyncio

import psycopg2
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv(".env")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
admin_password = pwd_context.hash("Admin@123")


def _make_sync_url(async_url: str) -> str:
    """
    Convert a postgresql+asyncpg:// URL to a postgresql:// URL that psycopg2
    can use directly.  Handles the ?ssl=require query param.
    """
    # Strip the +asyncpg driver part
    url = async_url.replace("postgresql+asyncpg://", "postgresql://")
    # asyncpg uses ?ssl=require, psycopg2 uses ?sslmode=require
    url = url.replace("?ssl=require", "?sslmode=require")
    return url


def seed():
    database_url = os.getenv("DATABASE_URL", "")
    if not database_url:
        print("Seed skipped: DATABASE_URL not set.")
        return

    sync_url = _make_sync_url(database_url)

    try:
        conn = psycopg2.connect(sync_url)
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id FROM users WHERE email = %s", ("admin@smartinbox.com",)
        )
        if cursor.fetchone():
            cursor.execute(
                "UPDATE users SET hashed_password=%s, role='admin', is_active=true "
                "WHERE email = %s",
                (admin_password, "admin@smartinbox.com"),
            )
            print(
                "Updated existing admin@smartinbox.com — password and admin role set."
            )
        else:
            cursor.execute(
                "INSERT INTO users (email, username, hashed_password, role, is_active) "
                "VALUES (%s, %s, %s, %s, %s)",
                (
                    "admin@smartinbox.com",
                    "SuperAdmin",
                    admin_password,
                    "admin",
                    True,
                ),
            )
            print(
                "Created new Admin! Email: admin@smartinbox.com | Password: Admin@123"
            )

        conn.commit()
        cursor.close()
        conn.close()
        print("Seed completed successfully.")
    except Exception as e:
        print(f"Seed failed: {e}")


if __name__ == "__main__":
    seed()
