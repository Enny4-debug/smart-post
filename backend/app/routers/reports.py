from fastapi import APIRouter, Depends
from typing import Annotated
from app.dependencies import require_staff_or_admin
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Reporting & Analytics"])


@router.get("/by-department", summary="Postponements by department")
async def by_department(staff: Annotated[User, Depends(require_staff_or_admin)]):
    return {"message": "By department — coming soon"}


@router.get("/by-reason", summary="Postponements by reason")
async def by_reason(staff: Annotated[User, Depends(require_staff_or_admin)]):
    return {"message": "By reason — coming soon"}


@router.get("/approval-timeline", summary="Approval duration report")
async def approval_timeline(staff: Annotated[User, Depends(require_staff_or_admin)]):
    return {"message": "Approval timeline — coming soon"}


@router.get("/pending", summary="All currently pending requests")
async def pending_report(staff: Annotated[User, Depends(require_staff_or_admin)]):
    return {"message": "Pending report — coming soon"}


@router.get("/trends", summary="Monthly/yearly trend analysis")
async def trends(staff: Annotated[User, Depends(require_staff_or_admin)]):
    return {"message": "Trends — coming soon"}


@router.get("/export", summary="Export report as PDF or CSV")
async def export(format: str = "csv", staff: User = Depends(require_staff_or_admin)):
    # format: 'pdf' | 'csv'
    return {"message": f"Export as {format} — coming soon"}
