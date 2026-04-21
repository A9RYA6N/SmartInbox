import asyncio
import os
import sys
from pathlib import Path

# Add project root to sys.path
root = Path(__file__).resolve().parents[2]
sys.path.append(str(root))

from app.database import AsyncSessionLocal, create_tables
from app.models.admin_log import AdminLog
from sqlalchemy import select, func

async def test_logs():
    print("Testing AdminLog query...")
    try:
        async with AsyncSessionLocal() as db:
            stmt = select(AdminLog).order_by(AdminLog.timestamp.desc())
            
            # Test count
            total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
            print(f"Total logs: {total}")
            
            # Test fetch
            rows = (await db.execute(stmt.limit(5))).scalars().all()
            for r in rows:
                print(f"Log: {r.id} | {r.action} | {getattr(r, 'severity', 'N/A')}")
            
            print("Query successful.")
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_logs())
