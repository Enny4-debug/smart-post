from fastapi import APIRouter, Depends
from typing import Annotated
from datetime import datetime, timezone
from app.dependencies import get_current_user, require_student, require_staff_or_admin
from app.models.user import User

router = APIRouter(prefix="/requests", tags=["Postponement Requests"])


from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.student import Student
from app.models.request import Request
from app.models.enums import RequestStatus, PostponementScope

class RequestCreate(BaseModel):
    academic_year: str
    semester: int
    reason: str
    scope: PostponementScope = PostponementScope.full_semester

@router.post("/", summary="Submit a new postponement request [Student]")
async def create_request(
    request_in: RequestCreate,
    user: Annotated[User, Depends(require_student)],
    db: AsyncSession = Depends(get_db)
):
    # Get or create student record
    result = await db.execute(select(Student).where(Student.user_id == user.user_id))
    student = result.scalar_one_or_none()
    
    if not student:
        import uuid
        student = Student(
            user_id=user.user_id,
            student_number=f"STU-{str(uuid.uuid4())[:8].upper()}",
            program="BSc Computer Science",
            year_of_study=1
        )
        db.add(student)
        await db.flush()

    new_request = Request(
        student_id=student.student_id,
        academic_year=request_in.academic_year,
        semester=request_in.semester,
        reason=request_in.reason,
        scope=request_in.scope,
        status=RequestStatus.pending_hod,
        submitted_at=datetime.now(timezone.utc)
    )
    db.add(new_request)
    await db.commit()
    
    return {"message": "Request submitted successfully", "request_id": str(new_request.request_id)}


@router.post("/draft", summary="Save request as draft [Student]")
async def save_draft(student: Annotated[User, Depends(require_student)]):
    # TODO: save draft without triggering verification
    return {"message": "Save draft — coming soon"}


@router.get("/my", summary="List my requests [Student]")
async def my_requests(
    user: Annotated[User, Depends(require_student)],
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Student).where(Student.user_id == user.user_id))
    student = result.scalar_one_or_none()
    
    if not student:
        return []

    req_result = await db.execute(
        select(Request)
        .where(Request.student_id == student.student_id)
        .order_by(Request.created_at.desc())
    )
    requests = req_result.scalars().all()
    
    return [
        {
            "request_id": str(r.request_id),
            "academic_year": r.academic_year,
            "semester": r.semester,
            "scope": r.scope,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None
        }
        for r in requests
    ]


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
