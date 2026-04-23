"""
Backend/services/job_service.py
------------------------------
Tracks background job status for SmartInbox.
"""

import uuid
import time
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel

class JobStatus(str, Enum):
    PENDING    = "pending"
    PROCESSING = "processing"
    COMPLETED  = "completed"
    FAILED     = "failed"

class JobInfo(BaseModel):
    id: str
    status: JobStatus
    progress: int = 0
    result: Optional[Any] = None
    error: Optional[str] = None
    created_at: float
    updated_at: float

class JobService:
    def __init__(self):
        self._jobs: Dict[str, JobInfo] = {}

    def create_job(self) -> str:
        job_id = str(uuid.uuid4())
        now = time.time()
        job = JobInfo(
            id=job_id,
            status=JobStatus.PENDING,
            created_at=now,
            updated_at=now
        )
        self._jobs[job_id] = job
        return job_id

    def update_job(
        self, 
        job_id: str, 
        status: Optional[JobStatus] = None, 
        progress: Optional[int] = None,
        result: Optional[Any] = None,
        error: Optional[str] = None
    ):
        if job_id not in self._jobs:
            return
        
        job = self._jobs[job_id]
        if status: job.status = status
        if progress is not None: job.progress = progress
        if result is not None: job.result = result
        if error: job.error = error
        
        job.updated_at = time.time()

    def get_job(self, job_id: str) -> Optional[JobInfo]:
        return self._jobs.get(job_id)

# Global Singleton
job_service = JobService()
