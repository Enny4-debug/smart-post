import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, INET, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.enums import AuditAction


class AuditLog(Base):
    __tablename__ = "audit_log"

    log_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # NULL when triggered by the system (e.g. scheduled escalation job)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True, index=True
    )
    request_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("requests.request_id"), nullable=True, index=True
    )
    action: Mapped[AuditAction] = mapped_column(String, nullable=False, index=True)
    entity_type: Mapped[str | None] = mapped_column(String(50), nullable=True)  # 'request' | 'user' | 'file' ...
    entity_id: Mapped[str | None] = mapped_column(Text, nullable=True)           # the PK of the affected entity
    metadata_: Mapped[dict | None] = mapped_column(
        "metadata", JSONB, nullable=True           # flexible: IP, diffs, old/new values
    )
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)   # IPv4 or IPv6
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )

    user: Mapped["User"] = relationship("User", lazy="joined")  # type: ignore

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} by user={self.user_id} at {self.created_at}>"
