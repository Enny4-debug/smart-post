# SmartPost — Project Status Report
**Last Updated:** 2026-07-01  
**Overall Completion: ~92%**

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Material-UI (Mantis template), MUI X-Charts |
| Backend | FastAPI (Python), SQLAlchemy (async), PostgreSQL |
| Auth | JWT (access + refresh tokens), bcrypt password hashing |
| ORM | SQLAlchemy with `asyncpg` driver |
| State | `localStorage` (access_token, userRole, userName, userAvatar) |

---

## 1. User Management Subsystem — 97% ✅

### ✅ Done
- JWT authentication (login, token refresh)
- Role-based login redirection:
  - `student` → `/student/dashboard`
  - `administrator` → `/admin/dashboard`
  - `hod_academic`, `hod_examinations`, `campus_manager` → `/staff/dashboard`
- Role-based sidebar navigation (distinct menus per role)
- Role label display in sidebar group title
- Admin: Create new users with role, department, and hashed password
- Admin: Edit existing users (name, role, department)
- Admin: Toggle user active/inactive status (cannot deactivate self)
- Profile page: view and edit name
- Profile page: upload and save profile picture (base64, stored in DB)
- Avatar displayed in header dropdown
- Logout (clears localStorage, redirects to login)
- Dynamic profile name/role in header
- `GET /auth/me` endpoint
- Password change: `POST /auth/change-password` with current_password + new_password validation
- Frontend Change Password page at `/change-password` route
- "Change Password" option in header profile dropdown (all roles)

### ❌ Remaining
- [ ] Password reset via email (forgot password flow)
- [ ] Admin: enforce strong password rules on creation

---

## 2. Postponement & Approval Subsystem — 98% ✅

### ✅ Done
- Student: Submit a new postponement request (academic year, semester, scope, reason)
- Student: View their submitted requests with status badges ("My Requests" page, polls every 10s)
- Student: Save request as draft (`POST /requests/draft`) — no verification, no notification
- Student: Submit saved draft (`POST /requests/{id}/submit`) — runs verification, notifies HoD
- Student: Re-submit after rejection (`POST /requests/{id}/resubmit`) — creates linked child request with `resubmission_count` incremented
- Student Dashboard: Recent requests table (last 5)
- Student: View full request timeline (`GET /requests/{id}`) — evidence files, approvals, audit log
- Frontend Request Detail page (`/student/requests/:id`): info card, student info, approvals, evidence table with download/preview, timeline with colored dots
- Backend: `POST /requests/` — creates request with `pending_hod` status, writes audit log
- Backend: `GET /requests/my` — returns requests for logged-in student
- Auto-create student profile record on first request if not present
- Staff (HoD Academic, HoD Examinations, Campus Manager): View pending requests per stage
- Staff: Approve / Reject / Query a request with comments
- Full workflow progression:
  - `pending_hod` → HoD Academic approves → `pending_hod_exams`
  - `pending_hod_exams` → HoD Examinations approves → `pending_manager`
  - `pending_manager` → Campus Manager approves → `approved`
  - Any stage can `reject` → `rejected`
  - Any stage can `query` → `queried`
- In-app notifications on every status change (see Section 8)
- Audit log written for request creation and every approval decision
- Staff Dashboard: Pending approvals table (last 5)
- Fee balance badge in approvals detail dialog (color-coded green/red)

### ❌ Remaining
- [ ] Email notifications alongside in-app notifications

---

## 3. Verification Subsystem — 90% ✅

### ✅ Done
- DB model has `fee_balance`, `fee_threshold`, `cumulative_postponed_years` fields on `Student`
- Fee balance displayed (read-only) in approvals detail dialog
- Fee balance check at submission time: `Student.fee_balance < Student.fee_threshold` → `fee_arrears`
- Max postponement years check: compares `Student.cumulative_postponed_years` against `SystemConfig.max_postponement_years`
- Auto-flags request as `ineligible` with reason (`fee_arrears` / `max_postponements_reached`) and detail message
- `admin_override` field on Request model: admin can bypass ineligibility
- `POST /admin/override/{request_id}` — sets status to `pending_hod`, records note + admin info, writes audit log
- `GET /admin/ineligible` — lists all ineligible requests for admin review
- Audit log entries with `admin_override` action type

### ❌ Remaining
- [ ] Sync student data from IAA's existing database (if API is available)
- [ ] `academic_probation` check

---

## 4. Document Management Subsystem — 95% ✅

### ✅ Done
- `POST /documents/{request_id}/upload` — multipart file upload, validates PDF/JPG/PNG, max 5MB
- Saves to `uploads/` directory with UUID filename
- `GET /documents/{request_id}/files` — lists non-deleted evidence for a request
- `GET /documents/download/{evidence_id}` — serves file for download/inline view
- `DELETE /documents/{evidence_id}` — soft delete with audit trail
- Frontend: File selector with progress bar on New Request form
- Frontend: Uploads happen after request creation (request_id available)
- Frontend: Remove file button + list of pending uploads
- Frontend: Download + preview on Request Detail page (modal with image/PDF iframe)
- Audit log entries for `evidence_uploaded` and `evidence_deleted` actions

### ❌ Remaining
- [x] Allow staff to download/view evidence from within the approvals dialog (download icon in detail dialog)

---

## 5. Reporting & Analytics Subsystem — 80% ✅

### ✅ Done
- Admin dashboard with 4 KPI cards wired to `/admin/stats` (Total, Action Required, Approved, Rejected)
- Staff dashboard with 4 KPI cards (role-aware `action_required` count)
- Reports page (`/staff/reports`) with:
  - 4 KPI cards (Total, Approved, Rejected, Pending)
  - Pie chart — requests by status
  - Bar chart — monthly request trends by year
  - Table — average approval time per approver role
  - Table — requests by programme
- Export buttons (CSV, Excel XLSX, PDF) using `/api/v1/reports/export`
- Audit log page (`/admin/audit`) with pagination, action/entity/role filters
- Admin Dashboard: User management table (last 5 users)
- Admin Dashboard: System rules summary card

### ❌ Remaining
- [ ] Staff: Filtered analytics for their department only
- [ ] Export with status filter

---

## 6. System Configuration — 100% ✅

### ✅ Done
- `SystemConfig` singleton model with fields:
  - `max_postponement_years`, `fee_threshold`
  - `hod_review_hours`, `escalation_hours`
  - `max_evidence_files`, `max_evidence_size_bytes`
  - `allowed_postponement_reasons` (array)
- `GET/PUT /api/v1/settings` endpoint
- Auto-creates singleton row on first GET if empty
- `PUT` restricted to Campus Manager + Admin only (uses `require_admin_or_manager`)
- Tracks `updated_by` user ID
- Staff Settings page (`/staff/settings`): 3 editable card sections (Academic Rules, Approval Workflow, Evidence Rules)
  - Campus Manager & Admin can edit; HoD users see read-only with badge
- Admin Settings page (`/admin/settings`) — shares same component

---

## 7. Notification System — 95% ✅

### ✅ Done
- `Notification` model with `notifications` table (recipient, subject, body, is_read, sent_at, etc.)
- `NotificationService` (`app/services/notification.py`):
  - `create_notification()` — generic notification creation
  - `notify_approvers_hod_academic()` — student submits → HoD Academic notified
  - `notify_approvers_hod_exams()` — HoD Academic approves → HoD Exams notified
  - `notify_approvers_campus_manager()` — HoD Exams approves → Campus Manager notified
  - `notify_student()` — final approval/rejection/query → student notified
  - `notify_admins_escalation()` — overdue requests → admin notified
- Notifications router (`/api/v1/notifications`):
  - `GET /notifications` — list current user's notifications
  - `GET /notifications/unread-count` — badge count
  - `PUT /notifications/{id}/read` — mark one as read
  - `PUT /notifications/read-all` — mark all as read
  - `POST /notifications/check-escalation` — find overdue requests, notify admins
- Hooks in `requests.py` (submission) and `approvals.py` (decisions)
- Frontend `Notification.jsx`:
  - Real bell badge count from API, polls every 30s
  - Dropdown lists actual notifications with subject, body preview, timestamp
  - Click dismisses + marks as read + decrements count + removes from list
  - "Mark all as read" button

### ❌ Remaining
- [ ] Email sending via SMTP (config exists, service not wired)

---

## 8. UI / UX Polish — 95% ✅

### ✅ Done
- SmartPost branding logo (replaces Mantis logo)
- Role-specific portals with distinct navigation menus
- Profile page with avatar upload
- Responsive layout (MUI Grid)
- Role label shown in sidebar group title
- Staff Approvals page — full functional table with detail dialog + decision confirmation
- Student MyRequests — auto-polls every 10 seconds, rows clickable → detail page, action buttons (Resubmit for rejected/queried, Edit Draft)
- Staff Dashboard — pending approvals table
- Student Dashboard — recent requests table
- Admin Dashboard — user management table + system rules card
- Reports page — charts + export buttons
- Dynamic "Welcome back, {name}" on student dashboard
- Request Detail page: info card, student info, approvals list, evidence file table with download/preview modal, timeline with color-coded dots

### ✅ Done (new)
- Snackbar Context — app-wide toast notifications (success/error/warning/info) via `useSnackbar()` hook
- New Request and Staff Approvals pages use snackbar instead of inline alerts
- 404 page at `*` catch-all route
- ErrorBoundary component wrapping Dashboard layout (`<Outlet>`)
- Password Change page with form validation (current/new/confirm password)
- SkeletonTable component replacing CircularProgress on MyRequests and Approvals tables

### ❌ Remaining
- [ ] Mobile responsiveness review

---

## 9. Infrastructure / DevOps — 35% ❌

### ✅ Done
- CORS configured for `localhost:3000`
- `.env` file for configuration
- Database seed script (`scripts/seed.py`) — seeds all 5 user roles
- `openpyxl` + `reportlab` installed for XLSX/PDF export
- APScheduler background worker — automated escalation check every 15 minutes
- Scheduler wired into FastAPI startup/shutdown lifecycle

### ❌ Remaining
- [ ] Production CORS update (real domain instead of localhost)
- [ ] Dockerize backend + frontend
- [ ] CI/CD pipeline
- [ ] Production deployment (e.g., VPS, Railway, Render)
- [ ] HTTPS setup
- [ ] Email service integration (SMTP configured in `.env` but not connected)

---

## Priority Roadmap

### Phase 1 — Core Workflow ✅ (Complete)
1. Staff Approvals page + approve/reject/query endpoints ✅
2. Request status progression (full multi-stage workflow) ✅
3. In-app notifications on status changes ✅

### Phase 2 — Data Integrity ✅ (Complete)
4. File upload (evidence documents) — backend + frontend ✅
5. Verification checks (fee balance, postponement limits) ✅
6. Admin override for ineligible requests ✅
7. Request detail / timeline page ✅
8. Draft-save + re-submit after rejection ✅

### Phase 3 — Reporting ✅ (Complete)
8. Real KPI data from DB ✅
9. Charts and analytics ✅
10. Audit log page ✅
11. Export to PDF/Excel ✅

### Phase 4 — Polish & Deployment ✅ (Complete)
12. Toast notifications (Snackbar) ✅
13. Password change ✅
14. 404 / Error boundary pages ✅
15. Skeleton loading screens ✅
16. Background escalation worker (APScheduler) ✅

### Phase 5 — Production Ready
17. Email notifications (SMTP integration)
18. Dockerize + deploy to production
19. Password reset via email
20. Mobile responsiveness review

---

## Known Technical Debt
| Issue | Location | Priority |
|---|---|---|
| Student profile auto-created with dummy data on first request | `requests.py` | Medium |
| Pydantic models defined inline in routers (should be in `/schemas`) | `users.py`, `requests.py` | Low |
| Imports placed mid-file instead of top | `users.py`, `requests.py` | Low |
| `menu-items/index.jsx` reads `localStorage` at module load time (not reactive) | `index.jsx` | Medium |
| Profile picture stored as base64 in DB (should use file reference + disk storage) | `users.py` | Medium |
