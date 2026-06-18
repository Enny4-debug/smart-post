from fastapi import APIRouter, Depends, Query
from typing import Annotated
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import require_staff_or_admin
from app.database import get_db
from app.models.user import User
from app.models.request import Request
from app.models.approval import Approval

router = APIRouter(prefix="/reports", tags=["Reporting & Analytics"])


@router.get("/summary", summary="Counts by request status")
async def summary(
    staff: Annotated[User, Depends(require_staff_or_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    rows = await db.execute(
        select(Request.status, func.count().label("count"))
        .where(Request.status != "draft")
        .group_by(Request.status)
        .order_by(Request.status)
    )
    status_counts = {row.status: row.count for row in rows}
    total = sum(status_counts.values())

    return {"total": total, "status_counts": status_counts}


@router.get("/trends", summary="Monthly request trends")
async def trends(
    staff: Annotated[User, Depends(require_staff_or_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
    year: int = Query(2026, ge=2020, le=2100),
):
    rows = await db.execute(
        select(
            extract("month", Request.created_at).label("month"),
            func.count().label("count"),
        )
        .where(
            Request.status != "draft",
            extract("year", Request.created_at) == year,
        )
        .group_by("month")
        .order_by("month")
    )
    monthly = {int(row.month): row.count for row in rows}
    data = [monthly.get(m, 0) for m in range(1, 13)]

    return {"year": year, "monthly": data}


@router.get("/by-program", summary="Requests grouped by programme")
async def by_program(
    staff: Annotated[User, Depends(require_staff_or_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    from app.models.student import Student
    rows = await db.execute(
        select(Student.program, func.count(Request.request_id).label("count"))
        .join(Request, Request.student_id == Student.student_id)
        .where(Request.status != "draft")
        .group_by(Student.program)
        .order_by(func.count(Request.request_id).desc())
    )
    return [{"program": r.program, "count": r.count} for r in rows]


@router.get("/approval-timeline", summary="Average approval time")
async def approval_timeline(
    staff: Annotated[User, Depends(require_staff_or_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    rows = await db.execute(
        select(
            Approval.approver_role,
            func.avg(
                func.extract("epoch", Approval.decided_at - Request.submitted_at)
            ).label("avg_seconds"),
            func.count().label("count"),
        )
        .join(Request, Request.request_id == Approval.request_id)
        .group_by(Approval.approver_role)
    )
    result = []
    for row in rows:
        role = row.approver_role
        avg_seconds = row.avg_seconds
        avg_hours = round(avg_seconds / 3600, 1) if avg_seconds else None
        result.append({
            "role": role,
            "average_hours": avg_hours,
            "total_decisions": row.count,
        })
    return result
