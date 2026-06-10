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
        "profile_picture": current_user.profile_picture,
        "is_active": current_user.is_active,
    }


from pydantic import BaseModel, EmailStr
from uuid import UUID

class UserUpdateMe(BaseModel):
    name: str | None = None
    profile_picture: str | None = None

@router.patch("/me", summary="Update current user profile")
async def update_me(
    user_in: UserUpdateMe,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    if user_in.name is not None:
        current_user.name = user_in.name
    if user_in.profile_picture is not None:
        current_user.profile_picture = user_in.profile_picture
    
    await db.commit()
    return {
        "message": "Profile updated successfully",
        "name": current_user.name,
        "profile_picture": current_user.profile_picture
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


from pydantic import BaseModel, EmailStr
from uuid import UUID

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    role: str
    department: str | None = None
    password: str

class UserUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    department: str | None = None

@router.post("/", summary="Create a new user [Admin only]")
async def create_user(
    user_in: UserCreate,
    admin: Annotated[User, Depends(require_admin)],
    db: AsyncSession = Depends(get_db),
):
    from app.routers.auth import pwd_context
    from fastapi import HTTPException
    
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user_in.name,
        email=user_in.email,
        role=user_in.role,
        department=user_in.department,
        password_hash=pwd_context.hash(user_in.password),
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    return {"message": "User created successfully", "user_id": str(new_user.user_id)}


@router.patch("/{user_id}", summary="Edit a user [Admin only]")
async def edit_user(
    user_id: UUID,
    user_in: UserUpdate,
    admin: Annotated[User, Depends(require_admin)],
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_in.name is not None:
        user.name = user_in.name
    if user_in.role is not None:
        user.role = user_in.role
    if user_in.department is not None:
        user.department = user_in.department
        
    await db.commit()
    return {"message": "User updated successfully"}


@router.patch("/{user_id}/toggle-status", summary="Toggle user active status [Admin only]")
async def toggle_user_status(
    user_id: UUID, 
    admin: Annotated[User, Depends(require_admin)],
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.user_id == admin.user_id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    user.is_active = not user.is_active
    await db.commit()
    return {"message": f"User status changed to {'active' if user.is_active else 'inactive'}", "is_active": user.is_active}
