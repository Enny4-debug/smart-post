from fastapi import APIRouter, Depends
from typing import Annotated
from app.dependencies import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("/me", summary="Get current user profile")
async def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return {
        "user_id": current_user.user_id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "department": current_user.department,
        "is_active": current_user.is_active,
    }


@router.get("/", summary="List all users [Admin only]")
async def list_users(admin: Annotated[User, Depends(require_admin)]):
    # TODO: paginated user list
    return {"message": "User list — coming soon"}


@router.post("/", summary="Create a new user [Admin only]")
async def create_user(admin: Annotated[User, Depends(require_admin)]):
    # TODO: user creation with role assignment
    return {"message": "Create user — coming soon"}


@router.patch("/{user_id}/deactivate", summary="Deactivate a user [Admin only]")
async def deactivate_user(user_id: str, admin: Annotated[User, Depends(require_admin)]):
    # TODO: soft-deactivate user
    return {"message": f"Deactivate user {user_id} — coming soon"}
