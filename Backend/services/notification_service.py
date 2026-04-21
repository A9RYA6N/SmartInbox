from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate
import uuid

async def create_notification(db: AsyncSession, schema: NotificationCreate) -> Notification:
    notif = Notification(
        user_id = schema.user_id,
        title   = schema.title,
        message = schema.message,
        type    = schema.type
    )
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif

async def get_user_notifications(db: AsyncSession, user_id: uuid.UUID):
    stmt = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
    return (await db.execute(stmt)).scalars().all()

async def mark_as_read(db: AsyncSession, notification_id: uuid.UUID, user_id: uuid.UUID):
    stmt = update(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).values(is_read=True)
    await db.execute(stmt)
    await db.commit()
