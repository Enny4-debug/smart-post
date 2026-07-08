import enum


class UserRole(str, enum.Enum):
    student = "student"
    hod_academic = "hod_academic"
    hod_examinations = "hod_examinations"
    campus_manager = "campus_manager"
    administrator = "administrator"


class RequestStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    ineligible = "ineligible"
    pending_hod = "pending_hod"
    pending_hod_exams = "pending_hod_exams"
    pending_manager = "pending_manager"
    queried = "queried"
    approved = "approved"
    rejected = "rejected"


class PostponementScope(str, enum.Enum):
    full_semester = "full_semester"
    specific_modules = "specific_modules"


class DecisionType(str, enum.Enum):
    approved = "approved"
    rejected = "rejected"
    queried = "queried"


class IneligibilityReason(str, enum.Enum):
    not_registered = "not_registered"
    data_mismatch = "data_mismatch"
    outstanding_fees = "outstanding_fees"
    fee_arrears = "fee_arrears"
    max_postponements_reached = "max_postponements_reached"
    limit_exceeded = "limit_exceeded"


class FileType(str, enum.Enum):
    pdf = "pdf"
    jpg = "jpg"
    png = "png"


class AuditAction(str, enum.Enum):
    request_created = "request_created"
    request_submitted = "request_submitted"
    request_drafted = "request_drafted"
    verification_passed = "verification_passed"
    verification_failed = "verification_failed"
    approval_decision = "approval_decision"
    file_uploaded = "file_uploaded"
    file_viewed = "file_viewed"
    record_viewed = "record_viewed"
    record_retrieved = "record_retrieved"
    escalation_triggered = "escalation_triggered"
    reminder_sent = "reminder_sent"
    notification_sent = "notification_sent"
    user_created = "user_created"
    user_updated = "user_updated"
    user_deactivated = "user_deactivated"
    rule_updated = "rule_updated"
    admin_override = "admin_override"
