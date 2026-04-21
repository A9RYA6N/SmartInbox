"""
app/models/admin_log.py  –  admin_logs table
Audit trail for all admin actions.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AdminLog(Base):
    __tablename__ = "admin_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    admin_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    admin_email: Mapped[str] = mapped_column(String(255), nullable=False)
    action: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    target_type: Mapped[str] = mapped_column(String(100), nullable=True)  # e.g., "user", "prediction"
    target_id: Mapped[str] = mapped_column(String(255), nullable=True)    # the affected resource id
    detail: Mapped[str] = mapped_column(Text, nullable=True)              # JSON blob or free text
    ip_address: Mapped[str] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[str] = mapped_column(Text, nullable=True)          # browser / client UA string
    severity: Mapped[str] = mapped_column(                                # INFO | WARNING | ERROR
        String(20), nullable=False, default="INFO", server_default="INFO", index=True
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    def __repr__(self) -> str:
        return f"<AdminLog id={self.id} action={self.action} admin={self.admin_email} severity={self.severity}>"
