import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, SmallInteger, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Student(Base):
    __tablename__ = "students"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    student_number: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    program: Mapped[str] = mapped_column(String(150), nullable=False)
    year_of_study: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    fee_balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    fee_threshold: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    cumulative_postponed_years: Mapped[Decimal] = mapped_column(
        Numeric(3, 1), nullable=False, default=Decimal("0.0")
    )
    synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # ── Relationships ─────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", lazy="joined")  # type: ignore
    requests: Mapped[list["Request"]] = relationship("Request", back_populates="student", lazy="select")  # type: ignore

    def __repr__(self) -> str:
        return f"<Student {self.student_number} - {self.program}>"
