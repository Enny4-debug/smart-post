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
from app.models.audit_log import AuditLog
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
    await db.flush()

    from app.models.system_config import SystemConfig

    # ── Verification checks ────────────────────────────────────────
    failures = []

    if student.fee_balance < student.fee_threshold:
        failures.append("fee_arrears")

    config_row = await db.execute(select(SystemConfig).where(SystemConfig.id == 1))
    config = config_row.scalar_one_or_none()
    max_years = float(config.max_postponement_years) if config else 2.0
    if student.cumulative_postponed_years >= max_years:
        failures.append("max_postponements_reached")

    if failures:
        new_request.status = RequestStatus.ineligible
        new_request.ineligibility_reason = failures[0]
        new_request.ineligibility_detail = (
            "Outstanding fee balance exceeds the allowed threshold."
            if failures[0] == "fee_arrears"
            else "Maximum cumulative postponement years reached."
        )

    # ── Audit ──────────────────────────────────────────────────────
    audit = AuditLog(
        user_id=user.user_id,
        request_id=new_request.request_id,
        action="request_created",
        entity_type="request",
        entity_id=str(new_request.request_id),
        metadata_={
            "academic_year": request_in.academic_year,
            "semester": request_in.semester,
            "scope": request_in.scope,
            "verification_failed": failures[0] if failures else None,
        },
    )
    db.add(audit)

    if not failures:
        from app.services.notification import notify_approvers_hod_academic
        await notify_approvers_hod_academic(db, new_request)

    await db.commit()

    msg = "Request submitted successfully"
    if failures:
        msg = f"Request flagged as ineligible: {failures[0].replace('_', ' ')}"
    
    return {"message": msg, "request_id": str(new_request.request_id), "status": new_request.status}


@router.post("/draft", summary="Save request as draft [Student]")
async def save_draft(
    request_in: RequestCreate,
    user: Annotated[User, Depends(require_student)],
    db: AsyncSession = Depends(get_db)
):
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
        status=RequestStatus.draft,
    )
    db.add(new_request)
    await db.commit()

    return {"message": "Draft saved", "request_id": str(new_request.request_id), "status": "draft"}


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
            "ineligibility_reason": r.ineligibility_reason,
            "ineligibility_detail": r.ineligibility_detail,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None
        }
        for r in requests
    ]


@router.get("/", summary="List all requests [Staff/Admin]")
async def list_requests(staff: Annotated[User, Depends(require_staff_or_admin)]):
    # TODO: paginated, filterable list
    return {"message": "All requests — coming soon"}


@router.get("/{request_id}", summary="Get full request detail with timeline")
async def get_request(
    request_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    from app.models.student import Student
    from app.models.approval import Approval
    from app.models.evidence import EvidenceFile
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Request)
        .options(
            selectinload(Request.student).selectinload(Student.user),
            selectinload(Request.approvals),
            selectinload(Request.evidence_files),
            selectinload(Request.modules),
        )
        .where(Request.request_id == request_id)
    )
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(404, "Request not found")

    is_owner = req.student and str(req.student.user_id) == str(user.user_id)
    is_staff = user.role in ("hod_academic", "hod_examinations", "campus_manager", "administrator")
    if not is_owner and not is_staff:
        raise HTTPException(403, "Access denied")

    audits_result = await db.execute(
        select(AuditLog)
        .options(selectinload(AuditLog.user))
        .where(AuditLog.request_id == req.request_id)
        .order_by(AuditLog.created_at.asc())
    )
    audit_entries = audits_result.scalars().all()

    decision_labels = {"approved": "Approved", "rejected": "Rejected", "queried": "Queried"}

    timeline = []
    for a in audit_entries:
        entry = {
            "type": "audit",
            "action": a.action,
            "user_name": a.user.name if a.user else "System",
            "timestamp": a.created_at.isoformat() if a.created_at else None,
            "metadata": a.metadata_,
        }
        timeline.append(entry)

    return {
        "request_id": str(req.request_id),
        "academic_year": req.academic_year,
        "semester": req.semester,
        "scope": req.scope,
        "reason": req.reason,
        "status": req.status,
        "ineligibility_reason": req.ineligibility_reason,
        "ineligibility_detail": req.ineligibility_detail,
        "submitted_at": req.submitted_at.isoformat() if req.submitted_at else None,
        "created_at": req.created_at.isoformat() if req.created_at else None,
        "student": {
            "name": req.student.user.name if req.student and req.student.user else "Unknown",
            "student_number": req.student.student_number if req.student else "Unknown",
            "program": req.student.program if req.student else "Unknown",
            "year_of_study": req.student.year_of_study if req.student else None,
        } if req.student else None,
        "approvals": [
            {
                "approval_id": str(a.approval_id),
                "approver_role": a.approver_role,
                "decision": a.decision,
                "comments": a.comments,
                "decided_at": a.decided_at.isoformat() if a.decided_at else None,
            }
            for a in req.approvals
        ] if req.approvals else [],
        "evidence_files": [
            {
                "evidence_id": str(ef.evidence_id),
                "original_name": ef.original_name,
                "file_type": ef.file_type,
                "size_bytes": ef.size_bytes,
                "uploaded_at": ef.uploaded_at.isoformat() if ef.uploaded_at else None,
            }
            for ef in req.evidence_files if not ef.is_deleted
        ] if req.evidence_files else [],
        "timeline": timeline,
    }


async def _run_verification(db: AsyncSession, student: Student, req: Request):
    from app.models.system_config import SystemConfig
    from app.models.enums import RequestStatus

    failures = []
    if student.fee_balance < student.fee_threshold:
        failures.append("fee_arrears")

    config_row = await db.execute(select(SystemConfig).where(SystemConfig.id == 1))
    config = config_row.scalar_one_or_none()
    max_years = float(config.max_postponement_years) if config else 2.0
    if student.cumulative_postponed_years >= max_years:
        failures.append("max_postponements_reached")

    if failures:
        req.status = RequestStatus.ineligible
        req.ineligibility_reason = failures[0]
        req.ineligibility_detail = (
            "Outstanding fee balance exceeds the allowed threshold."
            if failures[0] == "fee_arrears"
            else "Maximum cumulative postponement years reached."
        )
    else:
        req.status = RequestStatus.pending_hod
        req.submitted_at = datetime.now(timezone.utc)
        from app.services.notification import notify_approvers_hod_academic
        await notify_approvers_hod_academic(db, req)

    audit = AuditLog(
        user_id=student.user_id,
        request_id=req.request_id,
        action="request_submitted",
        entity_type="request",
        entity_id=str(req.request_id),
        metadata_={"verification_failed": failures[0] if failures else None},
    )
    db.add(audit)
    await db.commit()

    return req.status


@router.post("/{request_id}/submit", summary="Submit a saved draft [Student]")
async def submit_draft(
    request_id: str,
    user: Annotated[User, Depends(require_student)],
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Student).where(Student.user_id == user.user_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(404, "Student record not found")

    req_result = await db.execute(
        select(Request).where(
            Request.request_id == request_id,
            Request.student_id == student.student_id
        )
    )
    req = req_result.scalar_one_or_none()
    if not req:
        raise HTTPException(404, "Request not found")
    if req.status != RequestStatus.draft:
        raise HTTPException(400, f"Cannot submit request with status: {req.status}")

    status = await _run_verification(db, student, req)
    return {"message": "Draft submitted", "request_id": str(req.request_id), "status": status}


@router.post("/{request_id}/resubmit", summary="Re-submit after rejection [Student]")
async def resubmit_request(
    request_id: str,
    user: Annotated[User, Depends(require_student)],
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Student).where(Student.user_id == user.user_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(404, "Student record not found")

    parent_result = await db.execute(
        select(Request).where(
            Request.request_id == request_id,
            Request.student_id == student.student_id
        )
    )
    parent = parent_result.scalar_one_or_none()
    if not parent:
        raise HTTPException(404, "Request not found")
    if parent.status not in ("rejected", "queried"):
        raise HTTPException(400, f"Cannot resubmit request with status: {parent.status}")

    import uuid
    new_request = Request(
        student_id=student.student_id,
        academic_year=parent.academic_year,
        semester=parent.semester,
        reason=parent.reason,
        scope=parent.scope,
        status=RequestStatus.draft,
        parent_request_id=parent.request_id,
        resubmission_count=parent.resubmission_count + 1,
    )
    db.add(new_request)
    await db.flush()

    # Run verification
    status = await _run_verification(db, student, new_request)

    return {
        "message": "Resubmitted successfully",
        "request_id": str(new_request.request_id),
        "status": status,
    }
