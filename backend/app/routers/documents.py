from fastapi import APIRouter, Depends, UploadFile, File
from typing import Annotated
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/documents", tags=["Document Management"])


@router.post("/{request_id}/upload", summary="Upload evidence file")
async def upload_file(
    request_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    # TODO: validate type/size, save to upload_dir, record in DB, audit log
    return {"message": f"Upload for request {request_id} — coming soon"}


@router.get("/{request_id}/files", summary="List files attached to a request")
async def list_files(request_id: str, user: Annotated[User, Depends(get_current_user)]):
    # TODO: return non-deleted files with access check
    return {"message": f"Files for {request_id} — coming soon"}


@router.delete("/{evidence_id}", summary="Soft-delete a file [Admin only]")
async def delete_file(evidence_id: str, user: Annotated[User, Depends(get_current_user)]):
    # TODO: soft-delete, audit log entry
    return {"message": f"Delete file {evidence_id} — coming soon"}
