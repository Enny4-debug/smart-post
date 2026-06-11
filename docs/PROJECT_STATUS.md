# SmartPost — Project Status Report
**Last Updated:** 2026-06-10  
**Overall Completion: ~34%**

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Material-UI (Mantis template) |
| Backend | FastAPI (Python), SQLAlchemy (async), PostgreSQL |
| Auth | JWT (access + refresh tokens), bcrypt password hashing |
| ORM | SQLAlchemy with `asyncpg` driver |
| State | `localStorage` (access_token, userRole, userName, userAvatar) |

---

## 1. User Management Subsystem — 90% ✅

### ✅ Done
- JWT authentication (login, token refresh)
- Role-based login redirection:
  - `student` → `/student/dashboard`
  - `administrator` → `/admin/dashboard`
  - `hod_academic`, `hod_examinations`, `campus_manager` → `/staff/dashboard`
- Role-based sidebar navigation (distinct menus per role)
- Role label display in sidebar group title (e.g., "HoD Academic Portal")
- Admin: Create new users with role, department, and hashed password
- Admin: Edit existing users (name, role, department)
- Admin: Toggle user active/inactive status (cannot deactivate self)
- Profile page: view and edit name
- Profile page: upload and save profile picture (base64, stored in DB)
- Avatar displayed in header dropdown
- Logout (clears localStorage, redirects to login)
- Dynamic profile name/role in header

### ❌ Remaining
- [ ] Password change (allow user to update own password)
- [ ] Password reset via email (forgot password flow)
- [ ] Admin: enforce strong password rules on creation

---

## 2. Postponement & Approval Subsystem — 35% 🟡

### ✅ Done
- Student: Submit a new postponement request (academic year, semester, scope, reason)
- Student: View their submitted requests with status badges ("My Requests" page)
- Backend: `POST /requests/` — creates request with `pending_hod` status
- Backend: `GET /requests/my` — returns requests for logged-in student
- Auto-create student profile record on first request if not present

### ❌ Remaining
- [ ] Staff (HoD Academic): View all pending requests assigned to their stage
- [ ] Staff: Approve / Reject / Query a request with comments
- [ ] Workflow progression:
  - `pending_hod` → HoD Academic approves → `pending_hod_exams`
  - `pending_hod_exams` → HoD Examinations approves → `pending_manager`
  - `pending_manager` → Campus Manager approves → `approved`
  - Any stage can `reject` → `rejected`
  - Any stage can `query` → student responds → re-enters workflow
- [ ] Student: Re-submit after rejection or query response
- [ ] Email notifications on every status change
- [ ] Approval history/audit trail per request
- [ ] Student: View detailed request timeline (who approved what and when)
- [ ] Draft-save a request before final submission

---

## 3. Verification Subsystem — 5% ❌

### ✅ Done
- DB model has `fee_balance`, `fee_threshold`, `cumulative_postponed_years` fields on `Student`

### ❌ Remaining
- [ ] Check fee balance before allowing a request submission (block if outstanding fees exceed threshold)
- [ ] Check if student has exceeded maximum cumulative postponed years (policy: usually ≤ 2 years)
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

## 5. Reporting & Analytics Subsystem — 10% ❌

### ✅ Done
- Admin dashboard UI with KPI cards (Total Requests, Action Required, Escalated)
- Staff dashboard UI with summary cards

### ❌ Remaining
- [ ] Wire KPI cards to real database queries (currently hardcoded or empty)
- [ ] Admin: Requests by status breakdown chart (pie / bar chart)
- [ ] Admin: Requests over time line chart (monthly trends)
- [ ] Admin: Requests by department breakdown
- [ ] Admin: Average approval turnaround time
- [ ] Export reports as PDF or Excel
- [ ] Audit log page (`/admin/audit`) — track all user actions with timestamps
- [ ] Staff: Filtered analytics for their department only

---

## 6. UI / UX Polish — 60% 🟡

### ✅ Done
- SmartPost branding logo (replaces Mantis logo)
- Role-specific portals with distinct navigation menus
- Profile page with avatar upload
- Responsive layout (MUI Grid)
- Role label shown in sidebar group title

### ❌ Remaining
- [ ] Request Detail page (student clicks a request to see full timeline)
- [ ] Student Profile page (show student number, program, year)
- [ ] Staff Approvals page (`/staff/approvals`) — functional table
- [ ] 404 / Error boundary pages
- [ ] Loading skeleton screens instead of circular spinner
- [ ] Toast notifications (success/error) instead of page alerts
- [ ] Mobile responsiveness review

---

## 7. Infrastructure / DevOps — 20% ❌

### ✅ Done
- CORS configured for `localhost:3001`
- `.env` file for configuration
- Database seed script (`scripts/seed.py`)

### ❌ Remaining
- [ ] Production CORS update (real domain instead of localhost)
- [ ] Dockerize backend + frontend
- [ ] CI/CD pipeline
- [ ] Production deployment (e.g., VPS, Railway, Render)
- [ ] HTTPS setup
- [ ] Background task worker (for email sending)
- [ ] Email service integration (SMTP configured in `.env` but not connected)

---

## Priority Roadmap

### Phase 1 — Core Workflow (Most Critical)
1. Staff Approvals page + approve/reject/query endpoints
2. Request status progression (full multi-stage workflow)
3. Email notifications on status changes

### Phase 2 — Data Integrity
4. File upload (evidence documents) — backend + frontend
5. Verification checks (fee balance, postponement limits)
6. Admin override for ineligible requests

### Phase 3 — Reporting
7. Real KPI data from DB
8. Charts and analytics
9. Audit log page
10. Export to PDF/Excel

### Phase 4 — Polish & Deployment
11. Request detail / timeline page
12. Toast notifications
13. Dockerize + deploy to production

---

## Known Technical Debt
| Issue | Location | Priority |
|---|---|---|
| Student profile auto-created with dummy data on first request | `requests.py` | Medium |
| Pydantic models defined inline in routers (should be in `/schemas`) | `users.py`, `requests.py` | Low |
| Imports placed mid-file instead of top | `users.py`, `requests.py` | Low |
| `menu-items/index.jsx` reads `localStorage` at module load time (not reactive) | `index.jsx` | Medium |
| Profile picture stored as base64 in DB (should use file reference + disk storage) | `users.py` | Medium |
