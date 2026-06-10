from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Annotated
from app.dependencies import get_current_user, require_admin
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("/me", summary="Get current user profile")
async def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return {
        "user_id": str(current_user.user_id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "department": current_user.department,
        "is_active": current_user.is_active,
    }


@router.get("/", summary="List all users [Admin only]")
async def list_users(
    admin: Annotated[User, Depends(require_admin)],
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        {
            "user_id": str(u.user_id),
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "department": u.department or "—",
            "is_active": u.is_active,
            "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.post("/", summary="Create a new user [Admin only]")
async def create_user(admin: Annotated[User, Depends(require_admin)]):
    return {"message": "Create user — coming soon"}


@router.patch("/{user_id}/deactivate", summary="Deactivate a user [Admin only]")
async def deactivate_user(user_id: str, admin: Annotated[User, Depends(require_admin)]):
    return {"message": f"Deactivate user {user_id} — coming soon"}
