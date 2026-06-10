# Import all models here so Alembic and SQLAlchemy can discover them
from app.models.user import User
from app.models.student import Student
from app.models.module import Module
from app.models.request import Request, RequestModule
from app.models.evidence import EvidenceFile
from app.models.approval import Approval
from app.models.notification import Notification, EscalationLog
from app.models.audit_log import AuditLog
from app.models.system_config import SystemConfig

__all__ = [
    "User",
    "Student",
    "Module",
    "Request",
    "RequestModule",
    "EvidenceFile",
    "Approval",
    "Notification",
    "EscalationLog",
    "AuditLog",
    "SystemConfig",
]
