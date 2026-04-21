#!/bin/bash
set -e

echo "Running seed script..."
python /app/seed.py

echo "Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
