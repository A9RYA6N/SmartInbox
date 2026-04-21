"""
app/models/prediction.py  –  predictions table
"""

import uuid
from datetime import datetime, timezone

from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    message_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sms_messages.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    model_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("model_versions.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Core prediction fields ──────────────────────────────────────────────────
    prediction:     Mapped[int]   = mapped_column(Integer,  nullable=False)   # 0 or 1
    probability:    Mapped[float] = mapped_column(Float,    nullable=False)
    threshold_used: Mapped[float] = mapped_column(Float,    nullable=False)
    is_spam:        Mapped[bool]  = mapped_column(Boolean,  nullable=False)
    latency_ms:     Mapped[float] = mapped_column(Float,    nullable=True)
    model_version:  Mapped[str]   = mapped_column(String(50), nullable=False, default="v1")

    predicted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Relationships
    user:    Mapped["User"]       = relationship("User",       back_populates="predictions")
    message: Mapped["SMSMessage"] = relationship("SMSMessage", back_populates="prediction")

    def __repr__(self) -> str:
        return (
            f"<Prediction id={self.id} "
            f"is_spam={self.is_spam} prob={self.probability:.3f}>"
        )
