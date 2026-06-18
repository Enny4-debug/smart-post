from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.models.user import User
from app.models.enums import UserRole
from app.models.request import Request


async def create_notification(
    db: AsyncSession,
    recipient_id: str,
    subject: str,
    body: str,
    request_id: str | None = None,
    channel: str = "in_app",
) -> Notification:
    import uuid
    notif = Notification(
        notification_id=uuid.uuid4(),
        recipient_id=recipient_id,
        request_id=request_id,
        channel=channel,
        subject=subject,
        body=body,
    )
    db.add(notif)
    await db.flush()
    return notif


async def notify_approver_for_request(
    db: AsyncSession,
    request_obj: Request,
    role: UserRole,
    subject: str,
    body: str,
):
    result = await db.execute(
        select(User).where(User.role == role, User.is_active == True)
    )
    approvers = result.scalars().all()
    for approver in approvers:
        await create_notification(
            db,
            recipient_id=approver.user_id,
            subject=subject,
            body=body,
            request_id=request_obj.request_id,
        )


async def notify_approvers_hod_academic(db: AsyncSession, request_obj: Request):
    student_name = await _get_student_name(db, request_obj)
    await notify_approver_for_request(
        db, request_obj, UserRole.hod_academic,
        subject="New Postponement Request Pending Approval",
        body=f"Student {student_name} has submitted a new postponement request that requires your review.",
    )


async def notify_approvers_hod_exams(db: AsyncSession, request_obj: Request):
    student_name = await _get_student_name(db, request_obj)
    await notify_approver_for_request(
        db, request_obj, UserRole.hod_examinations,
        subject="Postponement Request – HoD Academic Approved",
        body=f"Student {student_name}'s postponement request has been approved by HoD Academic and now requires your review.",
    )


async def notify_approvers_campus_manager(db: AsyncSession, request_obj: Request):
    student_name = await _get_student_name(db, request_obj)
    await notify_approver_for_request(
        db, request_obj, UserRole.campus_manager,
        subject="Postponement Request – HoD Examinations Approved",
        body=f"Student {student_name}'s postponement request has been approved by HoD Examinations and now requires your final review.",
    )


async def notify_student(
    db: AsyncSession,
    request_obj: Request,
    subject: str,
    body: str,
):
    from app.models.student import Student
    result = await db.execute(
        select(Student).where(Student.student_id == request_obj.student_id)
    )
    student = result.scalar_one_or_none()
    if not student:
        return
    await create_notification(
        db,
        recipient_id=student.user_id,
        subject=subject,
        body=body,
        request_id=request_obj.request_id,
    )


async def notify_admins_escalation(
    db: AsyncSession,
    request_obj: Request,
    pending_hours: int,
):
    subject = "Escalation Alert – Request Pending Too Long"
    body = (
        f"Request {request_obj.request_id} has been pending for {pending_hours} hours "
        f"in status '{request_obj.status}'. This exceeds the configured threshold."
    )
    result = await db.execute(
        select(User).where(User.role == UserRole.administrator, User.is_active == True)
    )
    admins = result.scalars().all()
    for admin in admins:
        await create_notification(
            db,
            recipient_id=admin.user_id,
            subject=subject,
            body=body,
            request_id=request_obj.request_id,
        )


async def _get_student_name(db: AsyncSession, request_obj: Request) -> str:
    from app.models.student import Student
    result = await db.execute(
        select(Student).where(Student.student_id == request_obj.student_id)
    )
    student = result.scalar_one_or_none()
    if student:
        result2 = await db.execute(
            select(User).where(User.user_id == student.user_id)
        )
        user = result2.scalar_one_or_none()
        if user:
            return user.name
    return "Unknown"
