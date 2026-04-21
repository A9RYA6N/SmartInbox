import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth.dependencies import CurrentUser, DBSession
from app.schemas.notification import NotificationOut, NotificationListResponse
from app.services.notification_service import get_user_notifications, mark_as_read

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get(
    "",
    response_model=NotificationListResponse,
    status_code=status.HTTP_200_OK,
    summary="List current user notifications",
)
async def list_notifications(
    user: CurrentUser,
    db:   DBSession,
) -> NotificationListResponse:
    items = await get_user_notifications(db, user.id)
    return NotificationListResponse(items=items)

@router.patch(
    "/{notification_id}/read",
    status_code=status.HTTP_200_OK,
    summary="Mark a notification as read",
)
async def read_notification(
    notification_id: uuid.UUID,
    user:            CurrentUser,
    db:              DBSession,
):
    await mark_as_read(db, notification_id, user.id)
    return {"message": "Notification marked as read."}
