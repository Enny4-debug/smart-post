from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing_extensions import Self

from app.dependencies import get_db, require_staff_or_admin, require_admin_or_manager
from app.models.user import User
from app.models.system_config import SystemConfig

router = APIRouter(prefix="/settings", tags=["System Configuration"])


async def _ensure_config(db: AsyncSession) -> SystemConfig:
    result = await db.execute(select(SystemConfig).where(SystemConfig.id == 1))
    config = result.scalar_one_or_none()
    if config is None:
        config = SystemConfig(id=1)
        db.add(config)
        await db.commit()
        await db.refresh(config)
    return config


class SystemConfigOut(BaseModel):
    max_postponement_years: float
    fee_threshold: float
    hod_review_hours: int
    escalation_hours: int
    max_evidence_files: int
    max_evidence_size_bytes: int
    allowed_postponement_reasons: list[str] | None

    @classmethod
    def from_orm(cls, config: SystemConfig) -> Self:
        return cls(
            max_postponement_years=float(config.max_postponement_years),
            fee_threshold=float(config.fee_threshold),
            hod_review_hours=config.hod_review_hours,
            escalation_hours=config.escalation_hours,
            max_evidence_files=config.max_evidence_files,
            max_evidence_size_bytes=config.max_evidence_size_bytes,
            allowed_postponement_reasons=config.allowed_postponement_reasons,
        )


class SystemConfigUpdate(BaseModel):
    max_postponement_years: float | None = Field(None, ge=0, le=10)
    fee_threshold: float | None = Field(None, ge=0)
    hod_review_hours: int | None = Field(None, ge=1, le=720)
    escalation_hours: int | None = Field(None, ge=1, le=720)
    max_evidence_files: int | None = Field(None, ge=1, le=50)
    max_evidence_size_bytes: int | None = Field(None, ge=1024, le=104857600)
    allowed_postponement_reasons: list[str] | None = None


@router.get("", summary="Get system configuration")
async def get_settings(
    staff: Annotated[User, Depends(require_staff_or_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    config = await _ensure_config(db)
    return SystemConfigOut.from_orm(config)


@router.put("", summary="Update system configuration")
async def update_settings(
    body: SystemConfigUpdate,
    editor: Annotated[User, Depends(require_admin_or_manager)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    config = await _ensure_config(db)
    update_data = body.model_dump(exclude_none=True)
    for key, value in update_data.items():
        if key == "fee_threshold":
            value = Decimal(str(value))
        elif key == "max_postponement_years":
            value = Decimal(str(value))
        setattr(config, key, value)
    config.updated_by = editor.user_id
    await db.commit()
    await db.refresh(config)
    return SystemConfigOut.from_orm(config)
