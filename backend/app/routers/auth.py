from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
from typing import Annotated
from passlib.context import CryptContext
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.dependencies import create_access_token, create_refresh_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


class ChangePasswordInput(BaseModel):
    current_password: str
    new_password: str


@router.post("/login", summary="Login and receive JWT tokens")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not pwd_context.verify(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled.")

    # Update last login
    await db.execute(
        update(User)
        .where(User.user_id == user.user_id)
        .values(last_login_at=datetime.now(timezone.utc))
    )
    await db.commit()

    token_data = {"sub": str(user.user_id), "role": user.role}
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
        "role": user.role,
        "name": user.name,
        "profile_picture": user.profile_picture,
    }


@router.get("/me", summary="Get current authenticated user")
async def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return {
        "user_id": str(current_user.user_id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "department": current_user.department,
        "profile_picture": current_user.profile_picture,
        "is_active": current_user.is_active,
        "last_login_at": current_user.last_login_at.isoformat() if current_user.last_login_at else None,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


@router.post("/change-password", summary="Change own password")
async def change_password(
    input_data: ChangePasswordInput,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if not pwd_context.verify(input_data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    if len(input_data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")
    if input_data.current_password == input_data.new_password:
        raise HTTPException(status_code=400, detail="New password must be different from current password.")

    new_hash = pwd_context.hash(input_data.new_password)
    await db.execute(
        update(User)
        .where(User.user_id == current_user.user_id)
        .values(password_hash=new_hash)
    )
    await db.commit()
    return {"message": "Password changed successfully."}


@router.post("/refresh", summary="Refresh access token")
async def refresh_token(token: str, db: Annotated[AsyncSession, Depends(get_db)]):
    from jose import jwt, JWTError
    from app.config import settings
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Invalid token type.")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")

    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive.")

    token_data = {"sub": str(user.user_id), "role": user.role}
    return {
        "access_token": create_access_token(token_data),
        "token_type": "bearer",
    }
