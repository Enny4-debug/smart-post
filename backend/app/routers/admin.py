from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Annotated

from app.dependencies import require_admin, require_staff_or_admin
from app.database import get_db
from app.models.user import User
from app.models.request import Request

router = APIRouter(prefix="/admin", tags=["Administration"])


@router.get("/stats", summary="Dashboard KPI counts")
async def get_stats(
    current_user: Annotated[User, Depends(require_staff_or_admin)],
    db: AsyncSession = Depends(get_db),
):
    """Return Total / Action-Required / Escalated request counts."""

    # Total submitted requests (exclude drafts)
    total_result = await db.execute(
        select(func.count()).where(Request.status != "draft")
    )
    total = total_result.scalar() or 0

    # Action required = status is 'submitted' (awaiting first review)
    action_result = await db.execute(
        select(func.count()).where(Request.status == "submitted")
    )
    action_required = action_result.scalar() or 0

    # Escalated = status is 'escalated'
    escalated_result = await db.execute(
        select(func.count()).where(Request.status == "escalated")
    )
    escalated = escalated_result.scalar() or 0

    return {
        "total_requests": total,
        "action_required": action_required,
        "escalated": escalated,
    }


@router.get("/config", summary="Get system configuration")
async def get_config(admin: Annotated[User, Depends(require_admin)]):
    return {"message": "System config — coming soon"}


@router.patch("/config", summary="Update system configuration")
async def update_config(admin: Annotated[User, Depends(require_admin)]):
    return {"message": "Update config — coming soon"}


@router.get("/audit-log", summary="View audit log with filters")
async def get_audit_log(admin: Annotated[User, Depends(require_admin)]):
    return {"message": "Audit log — coming soon"}


@router.get("/activity", summary="System activity overview")
async def system_activity(admin: Annotated[User, Depends(require_admin)]):
    return {"message": "System activity — coming soon"}


@router.post("/modules", summary="Add a module to the catalogue")
async def add_module(admin: Annotated[User, Depends(require_admin)]):
    return {"message": "Add module — coming soon"}


@router.get("/modules", summary="List all modules")
async def list_modules(admin: Annotated[User, Depends(require_admin)]):
    return {"message": "Modules list — coming soon"}
