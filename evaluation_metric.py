"""
app/models/evaluation_metric.py  –  evaluation_metrics table
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class EvaluationMetric(Base):
    """
    Stores a time-series of evaluation snapshots for a model version.
    Allows admin to track metric drift over time.
    """
    __tablename__ = "evaluation_metrics"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    model_version_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("model_versions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    metric_name:  Mapped[str]   = mapped_column(String(100), nullable=False)
    metric_value: Mapped[float] = mapped_column(Float,       nullable=False)
    split:        Mapped[str]   = mapped_column(String(50),  nullable=False, default="test")
    recorded_at:  Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    def __repr__(self) -> str:
        return f"<EvaluationMetric {self.metric_name}={self.metric_value:.4f}>"
