from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Annotated

from app.dependencies import require_admin, require_staff_or_admin
from app.database import get_db
from app.models.user import User
from app.models.request import Request
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/admin", tags=["Administration"])


PENDING_STATUSES = ["pending_hod", "pending_hod_exams", "pending_manager"]

ROLE_STATUS_MAP = {
    "hod_academic": "pending_hod",
    "hod_examinations": "pending_hod_exams",
    "campus_manager": "pending_manager",
}


@router.get("/stats", summary="Dashboard KPI counts")
async def get_stats(
    current_user: Annotated[User, Depends(require_staff_or_admin)],
    db: AsyncSession = Depends(get_db),
):
    pending_status = ROLE_STATUS_MAP.get(current_user.role)

    total_result = await db.execute(
        select(func.count()).where(Request.status != "draft")
    )
    total = total_result.scalar() or 0

    if pending_status:
        action_result = await db.execute(
            select(func.count()).where(Request.status == pending_status)
        )
        action_required = action_result.scalar() or 0
    else:
        action_result = await db.execute(
            select(func.count()).where(Request.status.in_(PENDING_STATUSES))
        )
        action_required = action_result.scalar() or 0

    approved_result = await db.execute(
        select(func.count()).where(Request.status == "approved")
    )
    total_approved = approved_result.scalar() or 0

    rejected_result = await db.execute(
        select(func.count()).where(Request.status == "rejected")
    )
    total_rejected = rejected_result.scalar() or 0

    return {
        "total_requests": total,
        "action_required": action_required,
        "total_approved": total_approved,
        "total_rejected": total_rejected,
    }


@router.get("/config", summary="Get system configuration")
async def get_config(admin: Annotated[User, Depends(require_admin)]):
    return {"message": "System config — coming soon"}


@router.patch("/config", summary="Update system configuration")
async def update_config(admin: Annotated[User, Depends(require_admin)]):
    return {"message": "Update config — coming soon"}


@router.get("/audit-log", summary="View audit log with filters")
async def get_audit_log(
    admin: Annotated[User, Depends(require_admin)],
    db: AsyncSession = Depends(get_db),
    action: str | None = Query(None, description="Filter by action type"),
    user_id: str | None = Query(None, description="Filter by user ID"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    query = (
        select(AuditLog)
        .options(selectinload(AuditLog.user))
        .order_by(AuditLog.created_at.desc())
    )
    if action:
        query = query.where(AuditLog.action == action)
    if user_id:
        query = query.where(AuditLog.user_id == user_id)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    result = await db.execute(query.offset(offset).limit(limit))
    entries = result.scalars().all()

    return {
        "total": total,
        "entries": [
            {
                "log_id": str(e.log_id),
                "user_id": str(e.user_id) if e.user_id else None,
                "user_name": e.user.name if e.user else "System",
                "request_id": str(e.request_id) if e.request_id else None,
                "action": e.action,
                "entity_type": e.entity_type,
                "entity_id": e.entity_id,
                "metadata": e.metadata_,
                "ip_address": e.ip_address,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in entries
        ],
    }


@router.get("/activity", summary="System activity overview")
async def system_activity(admin: Annotated[User, Depends(require_admin)]):
    return {"message": "System activity — coming soon"}


@router.post("/modules", summary="Add a module to the catalogue")
async def add_module(admin: Annotated[User, Depends(require_admin)]):
    return {"message": "Add module — coming soon"}


@router.get("/modules", summary="List all modules")
async def list_modules(admin: Annotated[User, Depends(require_admin)]):
    return {"message": "Modules list — coming soon"}
