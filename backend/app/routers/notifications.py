from fastapi import APIRouter, Depends, Query
from typing import Annotated
from datetime import datetime, timezone
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_current_user, require_staff_or_admin
from app.database import get_db
from app.models.user import User
from app.models.notification import Notification
from app.models.request import Request

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", summary="List current user's notifications")
async def list_notifications(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    result = await db.execute(
        select(Notification)
        .where(Notification.recipient_id == user.user_id)
        .order_by(Notification.sent_at.desc())
        .offset(offset)
        .limit(limit)
    )
    notifs = result.scalars().all()
    return [
        {
            "notification_id": str(n.notification_id),
            "request_id": str(n.request_id) if n.request_id else None,
            "channel": n.channel,
            "subject": n.subject,
            "body": n.body,
            "is_read": n.is_read,
            "sent_at": n.sent_at.isoformat() if n.sent_at else None,
        }
        for n in notifs
    ]


@router.get("/unread-count", summary="Get unread notification count")
async def unread_count(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(func.count())
        .select_from(Notification)
        .where(
            Notification.recipient_id == user.user_id,
            Notification.is_read == False,
        )
    )
    count = result.scalar() or 0
    return {"count": count}


@router.put("/{notification_id}/read", summary="Mark notification as read")
async def mark_read(
    notification_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    import uuid
    await db.execute(
        update(Notification)
        .where(
            Notification.notification_id == uuid.UUID(notification_id),
            Notification.recipient_id == user.user_id,
        )
        .values(is_read=True, read_at=datetime.now(timezone.utc))
    )
    await db.commit()
    return {"message": "Marked as read"}


@router.put("/read-all", summary="Mark all notifications as read")
async def mark_all_read(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await db.execute(
        update(Notification)
        .where(
            Notification.recipient_id == user.user_id,
            Notification.is_read == False,
        )
        .values(is_read=True, read_at=datetime.now(timezone.utc))
    )
    await db.commit()
    return {"message": "All notifications marked as read"}


@router.post("/check-escalation", summary="Check for requests exceeding escalation threshold")
async def check_escalation(
    staff: Annotated[User, Depends(require_staff_or_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    from datetime import timedelta
    from app.models.system_config import SystemConfig
    from app.services.notification import notify_admins_escalation

    result = await db.execute(select(SystemConfig).where(SystemConfig.id == 1))
    config = result.scalar_one_or_none()
    if not config:
        return {"escalated": 0}

    threshold_hours = config.escalation_hours
    cutoff = datetime.now(timezone.utc) - timedelta(hours=threshold_hours)

    # Find requests pending longer than the threshold
    rows = await db.execute(
        select(Request).where(
            Request.status.in_(["pending_hod", "pending_hod_exams", "pending_manager"]),
            Request.submitted_at <= cutoff,
        )
    )
    overdue = rows.scalars().all()

    for req in overdue:
        await notify_admins_escalation(db, req, threshold_hours)

    await db.commit()
    return {"escalated": len(overdue)}
