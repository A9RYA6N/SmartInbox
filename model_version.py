"""
app/models/model_version.py  –  model_versions table
"""

import uuid
from datetime import datetime, timezone

from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    version_tag:   Mapped[str]  = mapped_column(String(50),  unique=True, nullable=False, index=True)
    is_active:     Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    trained_by:    Mapped[str]  = mapped_column(String(255), nullable=True)

    # Performance metrics stored at registration time
    roc_auc:    Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    pr_auc:     Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    f1:         Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    accuracy:   Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    threshold:  Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    n_features: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes:      Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<ModelVersion tag={self.version_tag} active={self.is_active}>"
