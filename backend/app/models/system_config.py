import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    CheckConstraint, DateTime, ForeignKey, Integer,
    Numeric, SmallInteger, String, Text, func
)
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class SystemConfig(Base):
    __tablename__ = "system_config"
    __table_args__ = (
        CheckConstraint("id = 1", name="single_row"),
    )

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, default=1)
    max_postponement_years: Mapped[Decimal] = mapped_column(Numeric(3, 1), nullable=False, default=Decimal("2.0"))
    fee_threshold: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    hod_review_hours: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=48)
    escalation_hours: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=72)
    max_evidence_files: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=10)
    max_evidence_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False, default=5242880)
    allowed_postponement_reasons: Mapped[list[str] | None] = mapped_column(
        ARRAY(String), nullable=True
    )
    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return "<SystemConfig (singleton)>"
