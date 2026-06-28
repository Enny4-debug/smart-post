# SmartPost — Project Status Report
**Last Updated:** 2026-06-29  
**Overall Completion: ~70%**

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

## 1. User Management Subsystem — 95% ✅

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

### ❌ Remaining
- [ ] Password change (allow user to update own password)
- [ ] Password reset via email (forgot password flow)
- [ ] Admin: enforce strong password rules on creation

---

## 2. Postponement & Approval Subsystem — 90% ✅

### ✅ Done
- Student: Submit a new postponement request (academic year, semester, scope, reason)
- Student: View their submitted requests with status badges ("My Requests" page, polls every 10s)
- Student Dashboard: Recent requests table (last 5)
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
- [ ] Student: Re-submit after rejection or query response
- [ ] Student: View detailed request timeline (who approved what and when)
- [ ] Draft-save a request before final submission
- [ ] Email notifications alongside in-app notifications

---

## 3. Verification Subsystem — 5% ❌

### ✅ Done
- DB model has `fee_balance`, `fee_threshold`, `cumulative_postponed_years` fields on `Student`
- Fee balance displayed (read-only) in approvals detail dialog

### ❌ Remaining
- [ ] Check fee balance before allowing a request submission (block if outstanding fees exceed threshold)
- [ ] Check if student has exceeded maximum cumulative postponed years
- [ ] Auto-flag request as `ineligible` with reason:
  - `fee_arrears` — owes fees
  - `max_postponements_reached` — exceeded limit
  - `academic_probation` — on probation
- [ ] Admin override: allow admin to bypass ineligibility with a note
- [ ] Sync student data from IAA's existing database (if API is available)

---

## 4. Document Management Subsystem — 10% ❌

### ✅ Done
- UI file upload button exists on New Request form (non-functional stub)
- `uploads/` directory configured in backend settings
- `EvidenceFile` model exists in the database schema

### ❌ Remaining
- [ ] Backend: `POST /documents/upload` — accept multipart file, save to `uploads/` directory
- [ ] Validate file type (PDF, JPG, PNG only) and size (max 5MB)
- [ ] Link uploaded file to a specific request (`request_id`)
- [ ] Backend: `GET /documents/{request_id}` — list documents attached to a request
- [ ] Frontend: Display attached documents on request detail view
- [ ] Allow staff to download/view evidence when reviewing a request
- [ ] Delete document (student can delete before submission)

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

## 7. Notification System — 90% ✅

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
- [ ] Automatic escalation check (cron/scheduler — currently manual endpoint)

---

## 8. UI / UX Polish — 80% ✅

### ✅ Done
- SmartPost branding logo (replaces Mantis logo)
- Role-specific portals with distinct navigation menus
- Profile page with avatar upload
- Responsive layout (MUI Grid)
- Role label shown in sidebar group title
- Staff Approvals page — full functional table with detail dialog + decision confirmation
- Student MyRequests — auto-polls every 10 seconds
- Staff Dashboard — pending approvals table
- Student Dashboard — recent requests table
- Admin Dashboard — user management table + system rules card
- Reports page — charts + export buttons
- Dynamic "Welcome back, {name}" on student dashboard

### ❌ Remaining
- [ ] Request Detail page (student clicks a request to see full timeline)
- [ ] 404 / Error boundary pages
- [ ] Loading skeleton screens instead of circular spinner
- [ ] Toast notifications (Snackbar) instead of page alerts
- [ ] Mobile responsiveness review

---

## 9. Infrastructure / DevOps — 20% ❌

### ✅ Done
- CORS configured for `localhost:3000`
- `.env` file for configuration
- Database seed script (`scripts/seed.py`) — seeds all 5 user roles
- `openpyxl` + `reportlab` installed for XLSX/PDF export

### ❌ Remaining
- [ ] Production CORS update (real domain instead of localhost)
- [ ] Dockerize backend + frontend
- [ ] CI/CD pipeline
- [ ] Production deployment (e.g., VPS, Railway, Render)
- [ ] HTTPS setup
- [ ] Background task worker (for email sending + escalation cron)
- [ ] Email service integration (SMTP configured in `.env` but not connected)

---

## Priority Roadmap

### Phase 1 — Core Workflow ✅ (Complete)
1. Staff Approvals page + approve/reject/query endpoints ✅
2. Request status progression (full multi-stage workflow) ✅
3. In-app notifications on status changes ✅

### Phase 2 — Data Integrity (Next)
4. File upload (evidence documents) — backend + frontend
5. Verification checks (fee balance, postponement limits)
6. Admin override for ineligible requests
7. Request detail / timeline page

### Phase 3 — Reporting ✅ (Complete)
8. Real KPI data from DB ✅
9. Charts and analytics ✅
10. Audit log page ✅
11. Export to PDF/Excel ✅

### Phase 4 — Polish & Deployment
12. Toast notifications
13. Password change
14. Email notifications
15. Dockerize + deploy to production

---

## Known Technical Debt
| Issue | Location | Priority |
|---|---|---|
| Student profile auto-created with dummy data on first request | `requests.py` | Medium |
| Pydantic models defined inline in routers (should be in `/schemas`) | `users.py`, `requests.py` | Low |
| Imports placed mid-file instead of top | `users.py`, `requests.py` | Low |
| `menu-items/index.jsx` reads `localStorage` at module load time (not reactive) | `index.jsx` | Medium |
| Profile picture stored as base64 in DB (should use file reference + disk storage) | `users.py` | Medium |
