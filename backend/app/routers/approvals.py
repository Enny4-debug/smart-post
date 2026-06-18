from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.dependencies import require_any_approver
from app.models.user import User
from app.models.request import Request, RequestModule
from app.models.student import Student
from app.models.approval import Approval
from app.models.audit_log import AuditLog
from app.database import get_db

router = APIRouter(prefix="/approvals", tags=["Approvals"])


def _next_status(role: str, decision: str) -> str:
    if decision == "rejected":
        return "rejected"
    if decision == "queried":
        return "queried"
    if role == "hod_academic":
        return "pending_hod_exams"
    if role == "hod_examinations":
        return "pending_manager"
    if role == "campus_manager":
        return "approved"
    return "rejected"


def _pending_status_for_role(role: str) -> str:
    mapping = {
        "hod_academic": "pending_hod",
        "hod_examinations": "pending_hod_exams",
        "campus_manager": "pending_manager",
    }
    return mapping[role]


@router.get("/pending", summary="Get requests pending my approval")
async def get_pending(
    approver: Annotated[User, Depends(require_any_approver)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    pending_status = _pending_status_for_role(approver.role)

    result = await db.execute(
        select(Request)
        .options(
            selectinload(Request.modules).selectinload(RequestModule.module),
            selectinload(Request.evidence_files),
            selectinload(Request.student).selectinload(Student.user),
        )
        .where(Request.status == pending_status)
        .order_by(Request.created_at.desc())
    )
    requests = result.scalars().all()

    return [
        {
            "request_id": str(r.request_id),
            "academic_year": r.academic_year,
            "semester": r.semester,
            "scope": r.scope,
            "reason": r.reason,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None,
            "resubmission_count": r.resubmission_count,
            "student": {
                "name": r.student.user.name if r.student and r.student.user else "Unknown",
                "student_number": r.student.student_number if r.student else "Unknown",
                "program": r.student.program if r.student else "Unknown",
                "year_of_study": r.student.year_of_study if r.student else None,
            } if r.student else None,
            "modules": [
                {
                    "code": rm.module.code if rm.module else None,
                    "name": rm.module.name if rm.module else None,
                }
                for rm in (r.modules or [])
            ],
            "evidence_files": [
                {
                    "evidence_id": str(ef.evidence_id),
                    "original_name": ef.original_name,
                    "file_type": ef.file_type,
                }
                for ef in (r.evidence_files or []) if not ef.is_deleted
            ],
        }
        for r in requests
    ]


class DecisionInput(BaseModel):
    decision: str  # "approved" | "rejected" | "queried"
    comments: str | None = None


@router.post("/{request_id}/decide", summary="Approve / Reject / Query a request")
async def decide(
    request_id: str,
    body: DecisionInput,
    approver: Annotated[User, Depends(require_any_approver)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    pending_status = _pending_status_for_role(approver.role)

    result = await db.execute(select(Request).where(Request.request_id == request_id))
    req = result.scalar_one_or_none()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status != pending_status:
        raise HTTPException(
            status_code=409,
            detail=f"This request is not pending your approval (status: {req.status})",
        )

    next_status = _next_status(approver.role, body.decision)

    approval = Approval(
        request_id=req.request_id,
        approver_id=approver.user_id,
        approver_role=approver.role,
        decision=body.decision,
        comments=body.comments,
    )
    db.add(approval)

    audit = AuditLog(
        user_id=approver.user_id,
        request_id=req.request_id,
        action="approval_decision",
        entity_type="request",
        entity_id=str(req.request_id),
        metadata_={
            "decision": body.decision,
            "comments": body.comments,
            "role": approver.role,
            "new_status": next_status,
        },
    )
    db.add(audit)

    req.status = next_status
    await db.commit()

    return {
        "message": f"Request {body.decision} successfully",
        "request_id": str(req.request_id),
        "new_status": next_status,
    }
