import uuid
from datetime import datetime
from sqlalchemy import (
    Boolean, DateTime, Enum, ForeignKey, SmallInteger,
    String, Text, UniqueConstraint, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.enums import (
    RequestStatus, PostponementScope, IneligibilityReason
)


class Request(Base):
    __tablename__ = "requests"

    request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.student_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    academic_year: Mapped[str] = mapped_column(String(10), nullable=False, index=True)  # e.g. "2025/2026"
    semester: Mapped[int] = mapped_column(SmallInteger, nullable=False)                 # 1 or 2
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus, name="request_status", native_enum=True),
        nullable=False,
        default=RequestStatus.draft,
        index=True,
    )
    scope: Mapped[PostponementScope] = mapped_column(
        Enum(PostponementScope, name="postponement_scope", native_enum=True),
        nullable=False,
        default=PostponementScope.full_semester,
    )

    # ── Submission ───────────────────────────────────────────────
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)

    # ── Verification ─────────────────────────────────────────────
    ineligibility_reason: Mapped[IneligibilityReason | None] = mapped_column(
        Enum(IneligibilityReason, name="ineligibility_reason", native_enum=True),
        nullable=True,
    )
    ineligibility_detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    admin_override: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    admin_override_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True
    )
    admin_override_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Re-submission ────────────────────────────────────────────
    parent_request_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("requests.request_id"), nullable=True
    )
    resubmission_count: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)

    # ── Timestamps ───────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # ── Relationships ─────────────────────────────────────────────
    student: Mapped["Student"] = relationship("Student", back_populates="requests", lazy="joined")  # type: ignore
    modules: Mapped[list["RequestModule"]] = relationship(
        "RequestModule", back_populates="request", cascade="all, delete-orphan", lazy="select"
    )
    evidence_files: Mapped[list["EvidenceFile"]] = relationship(  # type: ignore
        "EvidenceFile", back_populates="request", cascade="all, delete-orphan", lazy="select"
    )
    approvals: Mapped[list["Approval"]] = relationship(  # type: ignore
        "Approval", back_populates="request", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<Request {self.request_id} - {self.status}>"


class RequestModule(Base):
    __tablename__ = "request_modules"
    __table_args__ = (UniqueConstraint("request_id", "module_id", name="uq_request_module"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("requests.request_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    module_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("modules.module_id", ondelete="RESTRICT"),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────
    request: Mapped["Request"] = relationship("Request", back_populates="modules")
    module: Mapped["Module"] = relationship("Module", lazy="joined")  # type: ignore
