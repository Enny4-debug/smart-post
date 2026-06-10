from fastapi import APIRouter, Depends
from typing import Annotated
from app.dependencies import require_admin
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["Administration"])


@router.get("/config", summary="Get system configuration")
async def get_config(admin: Annotated[User, Depends(require_admin)]):
    # TODO: return SystemConfig singleton
    return {"message": "System config — coming soon"}


@router.patch("/config", summary="Update system configuration")
async def update_config(admin: Annotated[User, Depends(require_admin)]):
    # TODO: update config fields, audit log entry
    return {"message": "Update config — coming soon"}


@router.get("/audit-log", summary="View audit log with filters")
async def get_audit_log(admin: Annotated[User, Depends(require_admin)]):
    # TODO: filterable, paginated audit log
    return {"message": "Audit log — coming soon"}


@router.get("/activity", summary="System activity overview")
async def system_activity(admin: Annotated[User, Depends(require_admin)]):
    # TODO: active requests count, pending approvals, recent escalations
    return {"message": "System activity — coming soon"}


@router.post("/modules", summary="Add a module to the catalogue")
async def add_module(admin: Annotated[User, Depends(require_admin)]):
    # TODO: create module record
    return {"message": "Add module — coming soon"}


@router.get("/modules", summary="List all modules")
async def list_modules(admin: Annotated[User, Depends(require_admin)]):
    # TODO: return modules list
    return {"message": "Modules list — coming soon"}
