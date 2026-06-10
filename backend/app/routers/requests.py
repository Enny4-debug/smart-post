from fastapi import APIRouter, Depends
from typing import Annotated
from app.dependencies import get_current_user, require_student, require_staff_or_admin
from app.models.user import User

router = APIRouter(prefix="/requests", tags=["Postponement Requests"])


@router.post("/", summary="Submit a new postponement request [Student]")
async def create_request(student: Annotated[User, Depends(require_student)]):
    # TODO: validate fields, run verification, create request record
    return {"message": "Create request — coming soon"}


@router.post("/draft", summary="Save request as draft [Student]")
async def save_draft(student: Annotated[User, Depends(require_student)]):
    # TODO: save draft without triggering verification
    return {"message": "Save draft — coming soon"}


@router.get("/my", summary="List my requests [Student]")
async def my_requests(student: Annotated[User, Depends(require_student)]):
    # TODO: return student's own requests
    return {"message": "My requests — coming soon"}


@router.get("/", summary="List all requests [Staff/Admin]")
async def list_requests(staff: Annotated[User, Depends(require_staff_or_admin)]):
    # TODO: paginated, filterable list
    return {"message": "All requests — coming soon"}


@router.get("/{request_id}", summary="Get request detail")
async def get_request(request_id: str, user: Annotated[User, Depends(get_current_user)]):
    # TODO: fetch with role-scoped access check
    return {"message": f"Request {request_id} detail — coming soon"}


@router.post("/{request_id}/submit", summary="Submit a saved draft [Student]")
async def submit_draft(request_id: str, student: Annotated[User, Depends(require_student)]):
    # TODO: move draft to submitted, trigger verification
    return {"message": f"Submit draft {request_id} — coming soon"}


@router.post("/{request_id}/resubmit", summary="Re-submit after rejection [Student]")
async def resubmit_request(request_id: str, student: Annotated[User, Depends(require_student)]):
    # TODO: create new request linked to parent_request_id
    return {"message": f"Resubmit {request_id} — coming soon"}
