import asyncio
import sys
import os

# Add the current directory to sys.path so 'app' can be found
sys.path.append(os.getcwd())

from app.database import engine
from sqlalchemy import inspect

async def check():
    async with engine.connect() as conn:
        tables = await conn.run_sync(lambda sync_conn: inspect(sync_conn).get_table_names())
        print(f"Tables: {tables}")
        if 'notifications' in tables:
            print("SUCCESS: notifications table exists")
        else:
            print("FAILURE: notifications table missing")

if __name__ == "__main__":
    asyncio.run(check())
