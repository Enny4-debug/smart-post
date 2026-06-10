from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
from typing import Annotated
from passlib.context import CryptContext

from app.database import get_db
from app.models.user import User
from app.dependencies import create_access_token, create_refresh_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
