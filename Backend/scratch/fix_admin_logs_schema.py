import asyncio
import sys
from pathlib import Path

# Add project root to sys.path
root = Path(__file__).resolve().parents[2]
sys.path.append(str(root))

from app.database import engine
from sqlalchemy import text

async def fix_schema():
    print("Connecting to database to fix admin_logs schema...")
    try:
        async with engine.begin() as conn:
            # Check existing columns
            res = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'admin_logs'"))
            existing_cols = [r[0] for r in res.fetchall()]
            print(f"Existing columns: {existing_cols}")
            
            if 'user_agent' not in existing_cols:
                print("Adding user_agent column...")
                await conn.execute(text("ALTER TABLE admin_logs ADD COLUMN user_agent TEXT"))
            
            if 'severity' not in existing_cols:
                print("Adding severity column...")
                await conn.execute(text("ALTER TABLE admin_logs ADD COLUMN severity VARCHAR(20) NOT NULL DEFAULT 'INFO'"))
                await conn.execute(text("CREATE INDEX ix_admin_logs_severity ON admin_logs (severity)"))
            
            print("Schema fix complete.")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(fix_schema())
