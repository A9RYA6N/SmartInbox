"""
Backend/routers/jobs.py
----------------------
Router for checking background job status.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from app.services.job_service import job_service, JobInfo
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/{job_id}", response_model=JobInfo)
async def get_job_status(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get the status and result of a background job.
    """
    job = job_service.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found."
        )
    return job
