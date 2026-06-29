import os, uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import Annotated
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.request import Request
from app.models.evidence import EvidenceFile
from app.models.audit_log import AuditLog
from app.models.enums import AuditAction
from app.config import settings

router = APIRouter(prefix="/documents", tags=["Document Management"])

ALLOWED_TYPES = {"pdf", "jpg", "jpeg", "png"}
MAX_BYTES = settings.max_file_size_bytes
UPLOAD_DIR = settings.upload_dir


@router.post("/{request_id}/upload", summary="Upload evidence file")
async def upload_file(
    request_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(...),
):
    # Verify request exists
    result = await db.execute(select(Request).where(Request.request_id == request_id))
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(404, "Request not found")

    # Validate file extension
    ext = (file.filename or "").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else ""
    if ext not in ALLOWED_TYPES:
        raise HTTPException(400, f"File type '.{ext}' not allowed. Allowed: {', '.join(sorted(ALLOWED_TYPES))}")

    # Read content and validate size
    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(400, f"File too large ({len(content)} bytes). Max: {MAX_BYTES} bytes")

    # Save to disk
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    stored_name = f"{uuid.uuid4()}.{ext}"
    stored_path = os.path.join(UPLOAD_DIR, stored_name)
    with open(stored_path, "wb") as f:
        f.write(content)

    # Determine file_type enum
    file_type_str = "pdf" if ext == "pdf" else ("jpg" if ext in ("jpg", "jpeg") else "png")

    # Create DB record
    ev = EvidenceFile(
        request_id=req.request_id,
        uploaded_by=user.user_id,
        original_name=file.filename or "unnamed",
        stored_path=stored_path,
        file_type=file_type_str,
        size_bytes=len(content),
    )
    db.add(ev)
    await db.flush()

    # Audit log
    audit = AuditLog(
        user_id=user.user_id,
        request_id=req.request_id,
        action=AuditAction.file_uploaded,
        entity_type="evidence",
        entity_id=str(ev.evidence_id),
        metadata_={"original_name": file.filename, "size_bytes": len(content), "file_type": file_type_str},
    )
    db.add(audit)
    await db.commit()

    return {
        "message": "File uploaded successfully",
        "evidence_id": str(ev.evidence_id),
        "original_name": ev.original_name,
        "file_type": ev.file_type,
        "size_bytes": ev.size_bytes,
    }


@router.get("/{request_id}/files", summary="List files attached to a request")
async def list_files(
    request_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(EvidenceFile)
        .where(EvidenceFile.request_id == request_id, EvidenceFile.is_deleted == False)
    )
    files = result.scalars().all()
    return [
        {
            "evidence_id": str(ef.evidence_id),
            "original_name": ef.original_name,
            "file_type": ef.file_type,
            "size_bytes": ef.size_bytes,
            "uploaded_at": ef.uploaded_at.isoformat() if ef.uploaded_at else None,
        }
        for ef in files
    ]


@router.get("/download/{evidence_id}", summary="Download a file")
async def download_file(
    evidence_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    from fastapi.responses import FileResponse

    result = await db.execute(
        select(EvidenceFile).where(EvidenceFile.evidence_id == evidence_id, EvidenceFile.is_deleted == False)
    )
    ef = result.scalar_one_or_none()
    if not ef:
        raise HTTPException(404, "File not found")

    if not os.path.exists(ef.stored_path):
        raise HTTPException(404, "File not found on disk")

    media_type = "application/pdf" if ef.file_type == "pdf" else "image/jpeg" if ef.file_type in ("jpg", "jpeg") else "image/png"
    return FileResponse(
        path=ef.stored_path,
        media_type=media_type,
        filename=ef.original_name,
    )


@router.delete("/{evidence_id}", summary="Soft-delete a file")
async def delete_file(
    evidence_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(EvidenceFile).where(EvidenceFile.evidence_id == evidence_id))
    ef = result.scalar_one_or_none()
    if not ef:
        raise HTTPException(404, "File not found")

    ef.is_deleted = True
    ef.deleted_at = datetime.now(timezone.utc)
    ef.deleted_by = user.user_id

    audit = AuditLog(
        user_id=user.user_id,
        request_id=ef.request_id,
        action="file_deleted",
        entity_type="evidence",
        entity_id=str(ef.evidence_id),
    )
    db.add(audit)
    await db.commit()

    return {"message": "File deleted successfully"}
