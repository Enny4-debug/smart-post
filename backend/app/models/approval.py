import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.enums import DecisionType, UserRole


class Approval(Base):
    __tablename__ = "approvals"

    approval_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("requests.request_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    approver_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=False,
        index=True,
    )
    approver_role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role", native_enum=False, create_constraint=False), nullable=False)  # snapshot at decision time
    decision: Mapped[DecisionType] = mapped_column(Enum(DecisionType, name="decision_type", native_enum=False, create_constraint=False), nullable=False)
    comments: Mapped[str | None] = mapped_column(Text, nullable=True)
    decided_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # ── Escalation ────────────────────────────────────────────────
    was_escalated: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    escalated_from: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True
    )

    # ── Relationships ─────────────────────────────────────────────
    request: Mapped["Request"] = relationship("Request", back_populates="approvals")  # type: ignore
    approver: Mapped["User"] = relationship("User", foreign_keys=[approver_id], lazy="joined")  # type: ignore

    def __repr__(self) -> str:
        return f"<Approval {self.decision} by {self.approver_role} on {self.request_id}>"
