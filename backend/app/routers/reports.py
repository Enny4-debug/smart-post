from fastapi import APIRouter, Depends, Query
from typing import Annotated
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import require_staff_or_admin
from app.database import get_db
from app.models.user import User
from app.models.request import Request
from app.models.approval import Approval

router = APIRouter(prefix="/reports", tags=["Reporting & Analytics"])


@router.get("/summary", summary="Counts by request status")
async def summary(
    staff: Annotated[User, Depends(require_staff_or_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    rows = await db.execute(
        select(Request.status, func.count().label("count"))
        .where(Request.status != "draft")
        .group_by(Request.status)
        .order_by(Request.status)
    )
    status_counts = {row.status: row.count for row in rows}
    total = sum(status_counts.values())

    return {"total": total, "status_counts": status_counts}


@router.get("/trends", summary="Monthly request trends")
async def trends(
    staff: Annotated[User, Depends(require_staff_or_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
    year: int = Query(2026, ge=2020, le=2100),
):
    rows = await db.execute(
        select(
            extract("month", Request.created_at).label("month"),
            func.count().label("count"),
        )
        .where(
            Request.status != "draft",
            extract("year", Request.created_at) == year,
        )
        .group_by("month")
        .order_by("month")
    )
    monthly = {int(row.month): row.count for row in rows}
    data = [monthly.get(m, 0) for m in range(1, 13)]

    return {"year": year, "monthly": data}


@router.get("/by-program", summary="Requests grouped by programme")
async def by_program(
    staff: Annotated[User, Depends(require_staff_or_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    from app.models.student import Student
    rows = await db.execute(
        select(Student.program, func.count(Request.request_id).label("count"))
        .join(Request, Request.student_id == Student.student_id)
        .where(Request.status != "draft")
        .group_by(Student.program)
        .order_by(func.count(Request.request_id).desc())
    )
    return [{"program": r.program, "count": r.count} for r in rows]


@router.get("/approval-timeline", summary="Average approval time")
async def approval_timeline(
    staff: Annotated[User, Depends(require_staff_or_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    rows = await db.execute(
        select(
            Approval.approver_role,
            func.avg(
                func.extract("epoch", Approval.decided_at - Request.submitted_at)
            ).label("avg_seconds"),
            func.count().label("count"),
        )
        .join(Request, Request.request_id == Approval.request_id)
        .group_by(Approval.approver_role)
    )
    result = []
    for row in rows:
        role = row.approver_role
        avg_seconds = row.avg_seconds
        avg_hours = round(avg_seconds / 3600, 1) if avg_seconds else None
        result.append({
            "role": role,
            "average_hours": avg_hours,
            "total_decisions": row.count,
        })
    return result


@router.get("/export", summary="Export requests as CSV, XLSX, or PDF")
async def export(
    format: str = Query("csv", regex="^(csv|xlsx|pdf)$"),
    status: str = Query(None, description="Filter by status"),
    staff: User = Depends(require_staff_or_admin),
    db: AsyncSession = Depends(get_db),
):
    from fastapi.responses import StreamingResponse
    from app.models.student import Student
    from sqlalchemy.orm import selectinload
    import csv, io, datetime

    q = (
        select(Request)
        .options(selectinload(Request.student).selectinload(Student.user))
        .where(Request.status != "draft")
        .order_by(Request.created_at.desc())
    )
    if status:
        q = q.where(Request.status == status)

    rows = await db.execute(q)
    requests = rows.scalars().all()

    def row_data(r):
        student_name = r.student.user.name if r.student and r.student.user else ""
        student_num = r.student.student_number if r.student else ""
        program = r.student.program if r.student else ""
        return {
            "request_id": str(r.request_id),
            "student": student_name,
            "student_number": student_num,
            "program": program,
            "reason": r.reason,
            "status": r.status,
            "scope": r.scope,
            "academic_year": r.academic_year,
            "semester": r.semester,
            "submitted_at": r.submitted_at.strftime("%Y-%m-%d %H:%M") if r.submitted_at else "",
        }

    if format == "csv":
        def csv_stream():
            buf = io.StringIO()
            w = csv.writer(buf)
            w.writerow(["Request ID", "Student", "Student #", "Program", "Reason", "Status", "Scope", "Academic Year", "Semester", "Submitted At"])
            for r in requests:
                d = row_data(r)
                w.writerow([d["request_id"], d["student"], d["student_number"], d["program"], d["reason"], d["status"], d["scope"], d["academic_year"], d["semester"], d["submitted_at"]])
            yield buf.getvalue()
        return StreamingResponse(
            csv_stream(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=requests.csv"},
        )

    elif format == "xlsx":
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

        wb = Workbook()
        ws = wb.active
        ws.title = "Requests"

        header_font = Font(bold=True, color="FFFFFF", size=11)
        header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
        thin_border = Border(
            left=Side(style="thin"),
            right=Side(style="thin"),
            top=Side(style="thin"),
            bottom=Side(style="thin"),
        )

        headers = ["Request ID", "Student", "Student #", "Program", "Reason", "Status", "Scope", "Academic Year", "Semester", "Submitted At"]
        for col, h in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=h)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center")
            cell.border = thin_border

        keys = ["request_id", "student", "student_number", "program", "reason", "status", "scope", "academic_year", "semester", "submitted_at"]
        for i, r in enumerate(requests, 2):
            d = row_data(r)
            for col, key in enumerate(keys, 1):
                cell = ws.cell(row=i, column=col, value=d.get(key, ""))
                cell.border = thin_border

        for col in ws.columns:
            max_len = max(len(str(cell.value or "")) for cell in col)
            ws.column_dimensions[col[0].column_letter].width = min(max_len + 4, 40)

        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=requests.xlsx"},
        )

    else:
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=landscape(A4), title="Requests Report")
        styles = getSampleStyleSheet()

        elements = []
        elements.append(Paragraph("Academic Postponement Requests Report", styles["Title"]))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}", styles["Normal"]))
        elements.append(Spacer(1, 12))

        table_data = [["ID", "Student", "Program", "Reason", "Status", "Submitted"]]
        for r in requests:
            d = row_data(r)
            table_data.append([
                str(r.request_id)[:8],
                d["student"],
                d["program"],
                (d["reason"][:50] + "...") if len(d["reason"]) > 50 else d["reason"],
                d["status"],
                d["submitted_at"],
            ])

        status_colors = {
            "approved": colors.Color(0.16, 0.77, 0.10, 0.15),
            "rejected": colors.Color(1, 0.30, 0.30, 0.15),
            "pending_hod": colors.Color(1, 0.68, 0.08, 0.15),
            "pending_hod_exams": colors.Color(1, 0.68, 0.08, 0.15),
            "pending_manager": colors.Color(1, 0.68, 0.08, 0.15),
        }

        t = Table(table_data, repeatRows=1)
        style_cmds = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.Color(0.27, 0.45, 0.77)),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]
        for idx, r in enumerate(requests):
            row_idx = idx + 1
            bg = status_colors.get(r.status)
            if bg:
                style_cmds.append(("BACKGROUND", (4, row_idx), (4, row_idx), bg))

        t.setStyle(TableStyle(style_cmds))
        elements.append(t)
        doc.build(elements)
        buf.seek(0)
        return StreamingResponse(
            buf,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=requests.pdf"},
        )
