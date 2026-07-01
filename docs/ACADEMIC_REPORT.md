---
title: "SmartPost — Digital Academic Postponement Management System"
author: "Enny Mwaseba"
reg_no: "STU-2024-001"
program: "Bachelor of Science in Computer Science"
year: "Year 3"
institute: "IAA College"
department: "Department of Information Technology"
duration: "January 2026 – June 2026"
---

# PRELIMINARY PAGES

---

## Cover Page

**IAA College**  
**Department of Information Technology**

---

**SmartPost — Digital Academic Postponement Management System**

---

**Student:** Enny Mwaseba  
**Registration Number:** STU-2024-001  
**Programme:** Bachelor of Science in Computer Science  
**Year of Study:** Year 3  
**Project Duration:** January 2026 – June 2026

---

## Acknowledgement

I would like to express my sincere gratitude to my supervisor, Dr. Smith, for his invaluable guidance, constructive feedback, and continuous encouragement throughout the development of this project. His expertise in software engineering and academic systems greatly shaped the direction and quality of this work.

I am also grateful to the staff at IAA College, particularly Ms. Johnson (HoD Examinations) and Mr. Kamau (Campus Manager), for their support in understanding the academic postponement workflow and providing domain-specific requirements that made this system practically relevant.

Special thanks to the Department of Information Technology for providing the necessary resources, laboratory facilities, and an enabling environment for research and development.

Finally, I acknowledge my classmates and family for their moral support and patience during the many hours spent designing, coding, and testing this system.

---

## Abstract/Summary

SmartPost is a web-based digital academic postponement management system developed for IAA College to replace the existing manual, paper-based postponement application process. The system digitises the entire workflow — from student submission through multi-level approval by the Head of Department (Academic), Head of Department (Examinations), and Campus Manager — culminating in a final approval or rejection decision.

The project followed a structured System Development Life Cycle (SDLC) approach using the Waterfall methodology. The frontend was built with React 18, Material-UI (Mantis template), and MUI X-Charts for analytics. The backend was implemented with FastAPI (Python), SQLAlchemy asynchronous ORM, and PostgreSQL for data persistence. Authentication uses JWT tokens with bcrypt password hashing.

Key features include: role-based user portals, online request submission with supporting document upload, automated verification checks (fee balance and maximum postponement years), a sequential multi-stage approval pipeline, in-app notifications at every workflow transition, system configuration management, audit logging, and comprehensive reporting with CSV/PDF/XLSX export capabilities.

The major challenge encountered was integrating real-time notification updates across multiple user roles while maintaining data consistency in an asynchronous backend environment. The system was tested using Postman for API endpoints and frontend manual testing across all five user roles. Recommendations include future integration with the college's Student Information System (SIS) for automated data synchronisation and email notification delivery via SMTP.

---

## Table of Contents

| Section | Page |
|---------|------|
| Cover Page | i |
| Acknowledgement | ii |
| Abstract/Summary | iii |
| Table of Contents | iv |
| List of Figures | v |
| List of Tables | vi |
| List of Acronyms/Abbreviations | vii |
| **Chapter 1: Introduction** | 1 |
| 1.1 Background Information | 1 |
| 1.2 Project Description | 2 |
| 1.3 Project Objectives | 3 |
| **Chapter 2: Main Body** | 5 |
| 2.1 Requirements Specification | 5 |
| 2.2 Requirements Analysis | 8 |
| 2.3 System Design | 12 |
| 2.4 System Implementation | 18 |
| 2.5 System Testing | 25 |
| **Chapter 3: Conclusion and Recommendations** | 28 |
| 3.1 Conclusion | 28 |
| 3.2 Recommendations | 29 |
| References | 30 |
| Appendices | 31 |

---

## List of Figures

| Figure No. | Caption | Page |
|------------|---------|------|
| Figure 2.1 | System Architecture Diagram | 13 |
| Figure 2.2 | Entity-Relationship Diagram | 14 |
| Figure 2.3 | Use Case Diagram | 15 |
| Figure 2.4 | Approval Workflow State Machine | 16 |
| Figure 2.5 | Frontend Component Hierarchy | 17 |
| Figure 2.6 | Student Dashboard — Recent Requests | 19 |
| Figure 2.7 | New Request Submission Form | 20 |
| Figure 2.8 | Staff Approvals — Pending Requests Table | 21 |
| Figure 2.9 | Approval Detail Dialog with Fee Balance | 22 |
| Figure 2.10 | Reports Page with Charts | 23 |
| Figure 2.11 | Settings Page — System Configuration | 24 |

---

## List of Tables

| Table No. | Header | Page |
|-----------|--------|------|
| Table 2.1 | Functional Requirements | 6 |
| Table 2.2 | Non-Functional Requirements | 7 |
| Table 2.3 | User Roles and Permissions Matrix | 8 |
| Table 2.4 | API Endpoint Summary | 10 |
| Table 2.5 | Database Schema — Key Tables | 11 |
| Table 2.6 | Test Cases — Approval Workflow | 26 |

---

## List of Acronyms/Abbreviations

| Acronym | Full Meaning |
|---------|-------------|
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| CSV | Comma-Separated Values |
| ERD | Entity-Relationship Diagram |
| GPT | Generative Pre-trained Transformer |
| HTML | HyperText Markup Language |
| HTTP | HyperText Transfer Protocol |
| JWT | JSON Web Token |
| KPI | Key Performance Indicator |
| MUI | Material-UI |
| ORM | Object-Relational Mapping |
| PDF | Portable Document Format |
| SDLC | System Development Life Cycle |
| SIS | Student Information System |
| SMTP | Simple Mail Transfer Protocol |
| SQL | Structured Query Language |
| SQLAlchemy | SQL Toolkit and Object-Relational Mapper |
| UI/UX | User Interface / User Experience |
| URL | Uniform Resource Locator |
| UUID | Universally Unique Identifier |
| XLSX | Microsoft Excel Open XML Spreadsheet |

---

# MAIN BODY

---

## Chapter 1: Introduction

### 1.1 Background Information

IAA College, like many higher education institutions, administers academic postponements — formal permissions granted to students to defer their studies for a specified period due to medical, financial, or personal reasons. The existing process at the college is entirely manual: students fill out paper forms, physically submit them to the Head of Department (HoD) Academic, who manually passes the form to the HoD Examinations, who then forwards it to the Campus Manager for final approval. This workflow suffers from several challenges:

**Inefficiency:** Paper forms are easily misplaced, and tracking the current status of a request requires manual follow-up calls or visits to multiple offices. A single request can take weeks to process due to physical transportation of documents between offices.

**Lack of transparency:** Students have no visibility into where their request stands in the approval chain. They cannot know whether it is pending with the HoD Academic, HoD Examinations, or Campus Manager without physically inquiring at each office.

**No audit trail:** There is no central record of who approved or rejected a request, when the decision was made, or what comments were attached. This makes accountability and historical reporting difficult or impossible.

**Manual verification:** Staff must manually verify a student's fee balance and cumulative postponement history before approving — a process that is error-prone and time-consuming, relying on separate paper records or siloed spreadsheets.

**Limited reporting:** Management cannot easily extract statistics such as approval rates, average processing times, or request trends by programme or semester without manually counting and categorising paper records.

The need for a digital solution became increasingly apparent as student enrolments grew and the volume of postponement requests rose correspondingly. SmartPost was conceived to address these challenges by providing a centralised, web-based platform that digitises the entire postponement lifecycle.

### 1.2 Project Description

SmartPost is a full-stack web application designed to manage academic postponement requests from initial submission through multi-stage approval, document verification, and final archiving. The system serves five distinct user roles, each with specific permissions and responsibilities:

1. **Student** — Submits postponement requests, attaches supporting evidence documents, tracks request status in real time, views full timeline and approval history, saves drafts, and resubmits after rejection.

2. **HoD Academic** — Reviews new requests, approves (advances to HoD Examinations), rejects, or queries for additional information.

3. **HoD Examinations** — Reviews requests forwarded from HoD Academic, approves (advances to Campus Manager), rejects, or queries.

4. **Campus Manager** — Makes the final approval decision, approves (finalises as approved) or rejects. Also manages system configuration settings.

5. **Administrator** — Manages user accounts (create, edit, activate/deactivate), views audit logs, overrides ineligible requests, and manages system configuration.

The system architecture follows a modern three-tier pattern:
- **Frontend (Presentation Tier):** React 18 single-page application with Material-UI components, role-based routing, and real-time polling for notifications.
- **Backend (Application Tier):** FastAPI Python server exposing RESTful API endpoints, handling business logic, authentication, and workflow orchestration.
- **Database (Data Tier):** PostgreSQL relational database managed through SQLAlchemy asynchronous ORM.

The application is developed iteratively using a phased approach: core workflow (submission + approval), data integrity (document upload + verification checks), reporting and analytics, and finally polish and infrastructure readiness.

### 1.3 Project Objectives

#### 1.3.1 Main Objective

To design, develop, and deploy a digital academic postponement management system for IAA College that eliminates manual paperwork, provides real-time tracking, enforces verification checks, maintains a complete audit trail, and delivers actionable reporting.

#### 1.3.2 Specific Objectives

1. **To develop a role-based online submission and approval platform** that allows students to submit postponement requests electronically and staff to review, approve, reject, or query them through a sequential workflow progressing through HoD Academic → HoD Examinations → Campus Manager.

2. **To implement automated verification checks** that validate a student's fee balance against a configurable threshold and compare cumulative postponed years against the maximum allowed, flagging ineligible requests with clear reasons.

3. **To create a document management subsystem** that enables students to upload supporting evidence (PDF, JPG, PNG) and allows staff to preview and download those documents during the review process.

4. **To build a real-time in-app notification system** that alerts approvers when a new request awaits their decision and notifies students when their request status changes, with an escalation mechanism for overdue requests.

5. **To develop a reporting and analytics dashboard** that displays key performance indicators (total requests, approval rate, average processing time), visual charts (status distribution, monthly trends), and supports data export in CSV, XLSX, and PDF formats.

6. **To implement an audit logging subsystem** that records every action taken within the system — request creation, approval decisions, document uploads, configuration changes — with timestamps and user identification for full accountability.

7. **To provide a configurable system settings interface** that allows campus managers and administrators to adjust business rules (maximum postponement years, fee threshold, review/ escalation time limits) without modifying source code.

---

## Chapter 2: Main Body

### 2.1 Requirements Specification

The requirements were gathered through interviews with stakeholders (the HoD Academic, HoD Examinations, Campus Manager, a student representative, and an IT administrator), analysis of existing paper forms and workflow documentation, and observation of the manual process in operation.

#### 2.1.1 Functional Requirements

**Table 2.1: Functional Requirements**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | The system shall allow students to register and log in using email and password. | High |
| FR-02 | The system shall support five user roles: student, hod_academic, hod_examinations, campus_manager, administrator. | High |
| FR-03 | Students shall be able to submit a postponement request specifying academic year, semester, scope (full semester or specific modules), and reason. | High |
| FR-04 | Students shall be able to attach supporting documents (PDF, JPG, PNG) to a request. | High |
| FR-05 | Students shall be able to save a request as a draft and submit it later. | Medium |
| FR-06 | Students shall be able to view their requests with real-time status updates. | High |
| FR-07 | Students shall be able to resubmit a rejected or queried request. | High |
| FR-08 | Students shall be able to view the full approval timeline for each request. | Medium |
| FR-09 | HoD Academic shall be able to view all requests pending their approval. | High |
| FR-10 | HoD Academic shall be able to approve, reject, or query a request with comments. | High |
| FR-11 | After HoD Academic approval, the request shall automatically advance to HoD Examinations. | High |
| FR-12 | HoD Examinations shall be able to approve, reject, or query a request with comments. | High |
| FR-13 | After HoD Examinations approval, the request shall automatically advance to Campus Manager. | High |
| FR-14 | Campus Manager shall be able to make the final approval decision or reject the request. | High |
| FR-15 | The system shall verify fee balance against a configurable threshold on submission. | High |
| FR-16 | The system shall verify cumulative postponed years against the maximum allowed on submission. | High |
| FR-17 | Requests that fail verification shall be flagged as `ineligible` with a reason. | High |
| FR-18 | Administrators shall be able to override ineligible requests with a note. | Medium |
| FR-19 | The system shall send in-app notifications to the relevant approver when a request is submitted. | High |
| FR-20 | The system shall notify the student when a decision is made on their request. | High |
| FR-21 | Administrators shall be notified when a request is overdue (exceeds escalation hours). | Medium |
| FR-22 | The system shall log every action with user ID, timestamp, and metadata for audit purposes. | High |
| FR-23 | Campus Manager and Administrator shall be able to view and modify system configuration settings. | High |
| FR-24 | The system shall provide a reports dashboard with KPI cards, charts, and data tables. | Medium |
| FR-25 | The system shall support export of report data to CSV, XLSX, and PDF formats. | Medium |
| FR-26 | Administrators shall be able to create, edit, and deactivate user accounts. | High |

#### 2.1.2 Non-Functional Requirements

**Table 2.2: Non-Functional Requirements**

| ID | Requirement | Category |
|----|-------------|----------|
| NFR-01 | The system shall respond to API requests within 2 seconds under normal load. | Performance |
| NFR-02 | The frontend shall poll for notification updates every 30 seconds without noticeable performance degradation. | Performance |
| NFR-03 | Passwords shall be hashed using bcrypt before storage. | Security |
| NFR-04 | Authentication shall use JWT tokens with a 30-minute access token lifetime. | Security |
| NFR-05 | Page load time shall not exceed 3 seconds on a standard broadband connection. | Usability |
| NFR-06 | The user interface shall be responsive and function on desktop and tablet screen sizes. | Usability |
| NFR-07 | The system shall support PostgreSQL as its database backend with asynchronous connections. | Maintainability |
| NFR-08 | The API shall follow RESTful conventions with consistent error responses. | Maintainability |
| NFR-09 | Uploaded files shall not exceed 5 MB and shall be validated for allowed types (PDF, JPG, PNG). | Reliability |
| NFR-10 | The system shall handle concurrent access by multiple users without data corruption. | Reliability |
| NFR-11 | The frontend and backend shall be separable and deployable independently. | Scalability |
| NFR-12 | All configuration (database URL, secret keys, CORS origins) shall be externalised in environment variables. | Maintainability |

### 2.2 Requirements Analysis

#### 2.2.1 User Roles and Permissions

The system defines five user roles with a hierarchical permission structure. Each role has access to specific features and data based on their responsibilities in the postponement workflow.

**Table 2.3: User Roles and Permissions Matrix**

| Feature | Student | HoD Academic | HoD Exams | Campus Manager | Admin |
|---------|---------|-------------|-----------|---------------|-------|
| Submit request | ✓ | - | - | - | - |
| View own requests | ✓ | - | - | - | - |
| Upload documents | ✓ | - | - | - | - |
| Approve/Reject/Query requests | - | ✓ (Stage 1) | ✓ (Stage 2) | ✓ (Stage 3) | - |
| View pending approvals | - | ✓ | ✓ | ✓ | - |
| Override ineligible requests | - | - | - | - | ✓ |
| View reports/analytics | - | ✓ | ✓ | ✓ | ✓ |
| Manage system config | - | (read-only) | (read-only) | ✓ | ✓ |
| Manage users | - | - | - | - | ✓ |
| View audit log | - | - | - | - | ✓ |

#### 2.2.2 Approval Workflow Analysis

The approval workflow is a sequential pipeline with three stages. Each stage is handled by a specific role, and the request can only move forward or be terminated (rejected) at each stage:

```
Student → [Submit] → pending_hod
  → HoD Academic → [Approve] → pending_hod_exams
                  → [Reject]  → rejected (terminal)
                  → [Query]   → queried (student responds)
  → HoD Examinations → [Approve] → pending_manager
                      → [Reject]  → rejected (terminal)
                      → [Query]   → queried (student responds)
  → Campus Manager → [Approve] → approved (terminal)
                    → [Reject]  → rejected (terminal)
```

This analysis revealed that each approval stage is independent, and no stage can skip another. The system must therefore maintain strict state transitions and prevent invalid transitions (e.g., a request cannot go from `pending_hod` directly to `pending_manager`).

#### 2.2.3 Verification Logic Analysis

Two verification checks run synchronously at submission time:

1. **Fee Balance Check:** Compares the student's `fee_balance` against their `fee_threshold`. If `fee_balance < fee_threshold`, the request is flagged with `ineligibility_reason = "fee_arrears"` and a descriptive detail message.

2. **Maximum Postponement Years Check:** Compares the student's `cumulative_postponed_years` against the system-wide `max_postponement_years` from the SystemConfig singleton. If `cumulative_postponed_years >= max_postponement_years`, the request is flagged with `ineligibility_reason = "max_postponements_reached"`.

The first failing check determines the ineligibility reason. If both pass, the request proceeds to `pending_hod` and the HoD Academic is notified.

#### 2.2.4 API Endpoint Design

The API was designed following RESTful conventions with versioned endpoints under `/api/v1/`. All endpoints requiring authentication use JWT Bearer tokens extracted from the `Authorization` header.

**Table 2.4: API Endpoint Summary**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login, returns JWT tokens | None |
| GET | `/auth/me` | Get current user profile | All |
| POST | `/auth/change-password` | Change own password | All |
| POST | `/auth/refresh` | Refresh access token | Token |
| POST | `/users/` | Create user (Admin) | Admin |
| GET | `/users/` | List users (Admin) | Admin |
| PUT | `/users/{id}` | Update user (Admin) | Admin |
| PATCH | `/users/{id}/toggle-status` | Activate/deactivate user | Admin |
| POST | `/requests/` | Submit new request | Student |
| POST | `/requests/draft` | Save draft | Student |
| GET | `/requests/my` | List own requests | Student |
| GET | `/requests/{id}` | Get full request detail | Owner/Staff |
| POST | `/requests/{id}/submit` | Submit draft | Student |
| POST | `/requests/{id}/resubmit` | Resubmit after rejection | Student |
| GET | `/approvals/pending` | List pending approvals | Staff |
| POST | `/approvals/{id}/decide` | Make approval decision | Staff |
| POST | `/documents/{req_id}/upload` | Upload evidence file | Owner |
| GET | `/documents/{req_id}/files` | List evidence files | Owner/Staff |
| GET | `/documents/download/{ev_id}` | Download evidence file | Staff/Owner |
| DELETE | `/documents/{ev_id}` | Soft-delete evidence | Owner |
| GET | `/reports/summary` | Summary KPIs | Staff/Admin |
| GET | `/reports/trends` | Monthly trends data | Staff/Admin |
| GET | `/reports/by-programme` | Requests by programme | Staff/Admin |
| GET | `/reports/approval-timeline` | Avg approval times | Staff/Admin |
| GET | `/reports/export` | Export data (CSV/XLSX/PDF) | Staff/Admin |
| GET | `/settings` | Get system configuration | Staff/Admin |
| PUT | `/settings` | Update system configuration | Manager/Admin |
| GET | `/notifications` | List user notifications | All |
| GET | `/notifications/unread-count` | Unread count | All |
| PUT | `/notifications/{id}/read` | Mark as read | Owner |
| PUT | `/notifications/read-all` | Mark all as read | All |
| POST | `/notifications/check-escalation` | Check overdue requests | All |
| GET | `/admin/stats` | Dashboard KPI counts | Staff/Admin |
| GET | `/admin/audit-log` | View audit log | Admin |
| GET | `/admin/ineligible` | List ineligible requests | Admin |
| POST | `/admin/override/{id}` | Override ineligibility | Admin |

#### 2.2.5 Database Schema Analysis

**Table 2.5: Database Schema — Key Tables**

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| `users` | user_id, name, email, password_hash, role, is_active | Authentication and user management |
| `students` | student_id, user_id(FK), student_number, program, year_of_study, fee_balance, fee_threshold, cumulative_postponed_years | Extended student profile and verification data |
| `requests` | request_id, student_id(FK), academic_year, semester, reason, scope, status, submitted_at, ineligibility_reason, admin_override, parent_request_id, resubmission_count | Core request records with workflow state |
| `approvals` | approval_id, request_id(FK), approver_role, decision, comments, decided_at | Individual approval decisions per role |
| `evidence_files` | evidence_id, request_id(FK), original_name, stored_name, file_type, size_bytes, is_deleted | Uploaded supporting documents |
| `audit_log` | log_id, user_id(FK), request_id(FK), action, entity_type, entity_id, metadata_(JSON), ip_address, created_at | Chronological record of all system actions |
| `notifications` | notification_id, recipient_id(FK), subject, body, is_read, sent_at | In-app notification records |
| `system_config` | id, max_postponement_years, fee_threshold, hod_review_hours, escalation_hours, max_evidence_files, max_evidence_size_bytes | Singleton business rule configuration |

### 2.3 System Design

#### 2.3.1 System Architecture

The system follows a three-tier client-server architecture:

```
┌─────────────────────────────────────┐
│         Presentation Tier           │
│   React 18 SPA + Material-UI       │
│   Port: 3000 (Vite dev server)      │
└──────────────┬──────────────────────┘
               │ HTTP (JSON)
               ▼
┌─────────────────────────────────────┐
│         Application Tier            │
│   FastAPI (Python)                  │
│   Port: 8000 (uvicorn)              │
│   ┌───────────┐  ┌──────────────┐   │
│   │ Routers   │  │ Services     │   │
│   │ (auth,    │  │ (notification│   │
│   │  requests,│  │  scheduler,  │   │
│   │  approvals│  │  reports)    │   │
│   │  etc.)    │  │              │   │
│   └─────┬─────┘  └──────────────┘   │
│         │                            │
│   ┌─────▼─────┐                      │
│   │   Models  │                      │
│   │ (SQLAlchemy ORM)                │
│   └─────┬─────┘                      │
└──────────┼──────────────────────────┘
           │ asyncpg (async)
           ▼
┌─────────────────────────────────────┐
│         Data Tier                   │
│   PostgreSQL 16                     │
│   Database: smartpost               │
└─────────────────────────────────────┘
```

**Figure 2.1: System Architecture Diagram**

The frontend communicates with the backend exclusively through RESTful API calls. The backend handles authentication via JWT middleware, validates requests through Pydantic models, executes business logic in service modules, and persists data through SQLAlchemy ORM models. File uploads are stored on the server filesystem under an `uploads/` directory, with only metadata (stored filename, original name, type, size) stored in the database.

#### 2.3.2 Entity-Relationship Diagram

The database design consists of eight primary tables with the following key relationships:

- **users** (1) ──→ (1) **students** — Each user can have at most one student profile.
- **users** (1) ──→ (many) **audit_log** — A user can perform many auditable actions.
- **users** (1) ──→ (many) **notifications** — A user can receive many notifications.
- **students** (1) ──→ (many) **requests** — A student can submit many requests.
- **requests** (1) ──→ (many) **approvals** — A request can have many approval records.
- **requests** (1) ──→ (many) **evidence_files** — A request can have many uploaded files.
- **requests** (1) ──→ (many) **request_modules** — A request can specify many modules.
- **requests** (1) ──→ (1) **requests** (self-referential via parent_request_id) — For resubmission tracking.

**Figure 2.2: Entity-Relationship Diagram**

#### 2.3.3 Use Case Diagram

The system supports five actors with the following use cases:

**Student:** Register, login, submit request, save draft, upload evidence, view request status, view timeline, resubmit request, change password, view profile.

**HoD Academic:** Login, view pending approvals, view request detail, download evidence, approve request, reject request, query request, view reports.

**HoD Examinations:** Login, view pending approvals, view request detail, download evidence, approve request, reject request, query request, view reports.

**Campus Manager:** Login, view pending approvals, view request detail, download evidence, approve request, reject request, manage system settings, view reports.

**Administrator:** Login, manage users, view audit log, override ineligible requests, manage system settings, view reports.

**Figure 2.3: Use Case Diagram**

#### 2.3.4 Approval Workflow State Machine

The state machine for request status transitions is defined as:

```
                  ┌──────────────┐
                  │    draft     │
                  └──────┬───────┘
                         │ submit
                         ▼
                  ┌──────────────┐
         ┌───────│  pending_hod │◄──── resubmit ────┐
         │       └──────┬───────┘                    │
         │              │ approve                    │
         │              ▼                            │
         │       ┌──────────────┐                    │
         │       │pending_hod_  │                    │
         │       │   exams      │                    │
         │       └──────┬───────┘                    │
         │              │ approve                    │
         │              ▼                            │
         │       ┌──────────────┐                    │
         │       │  pending_    │                    │
         │       │   manager    │                    │
         │       └──────┬───────┘                    │
         │              │ approve                    │
         │              ▼                            │
         │       ┌──────────────┐                    │
         │       │   approved   │                    │
         │       └──────────────┘                    │
         │                                           │
         ├── reject/query ──► ┌──────────────┐       │
         │                    │   rejected   │───────┘
         │         ┌─────────►│              │
         │         │          └──────────────┘
         │         │
         │         │          ┌──────────────┐
         └─────────┼─────────►│   queried    │
                   │          └──────────────┘
                   │
                   │          ┌──────────────┐
                   └─────────►│  ineligible  │── admin override ──► pending_hod
                              └──────────────┘
```

**Figure 2.4: Approval Workflow State Machine**

Validation rules are enforced at every transition:
- Only the assigned role can make a decision at their stage.
- A request cannot skip stages.
- Rejection and query are terminal transitions (except resubmission).
- Admin override is the only way to move from `ineligible` to `pending_hod`.

#### 2.3.5 Frontend Component Architecture

The frontend is organised as a single-page application with role-based routing:

```
App.jsx
 ├── ThemeCustomization (MUI theme provider)
 ├── SnackbarProvider (toast notification context)
 └── RouterProvider
      ├── LoginRoutes (unauthenticated)
      └── MainRoutes (authenticated via DashboardLayout)
           ├── Header (navbar with notification bell + profile)
           ├── Drawer (role-based sidebar menu)
           └── <Outlet> (page content via React Router)
                ├── student/ (Dashboard, NewRequest, MyRequests, RequestDetail, Profile, ChangePassword)
                ├── staff/ (Dashboard, Approvals, Reports, Settings, Profile, ChangePassword)
                └── admin/ (Dashboard, Users, Audit, Settings, Profile, ChangePassword)
```

**Figure 2.5: Frontend Component Hierarchy**

### 2.4 System Implementation

The implementation was carried out over several phases following the Waterfall SDLC methodology. Each phase produced tangible deliverables that were reviewed before proceeding to the next.

#### 2.4.1 Technology Stack Selection

| Layer | Technology Chosen | Rationale |
|-------|------------------|-----------|
| Frontend Framework | React 18 | Component-based architecture, large ecosystem, async rendering |
| UI Component Library | Material-UI (Mantis template) | Pre-built accessible components, consistent design system, responsive grid |
| State Management | React hooks + localStorage | Simplicity for this application scale; no need for Redux |
| HTTP Client | Axios | Interceptors for JWT injection, promise-based API |
| Charts | MUI X-Charts | Native MUI integration, minimal configuration |
| Backend Framework | FastAPI | Async support, automatic OpenAPI docs, Pydantic validation |
| ORM | SQLAlchemy 2.0 (async) | Mature ORM, async support with asyncpg, migration support |
| Database | PostgreSQL 16 | Robust ACID compliance, JSON support, production-ready |
| Authentication | JWT (python-jose + passlib) | Stateless, widely adopted, no server-side session storage |
| Background Tasks | APScheduler | Lightweight, async-compatible, in-process scheduling |

#### 2.4.2 Backend Implementation

The backend was structured with a modular architecture under `backend/app/`:

```
backend/app/
 ├── main.py           # FastAPI app, middleware, startup/shutdown
 ├── config.py         # Pydantic Settings from .env
 ├── database.py       # AsyncSessionLocal engine
 ├── dependencies.py   # JWT auth, role check dependencies
 ├── models/           # SQLAlchemy ORM models
 │   ├── enums.py
 │   ├── user.py, student.py, request.py
 │   ├── approval.py, evidence.py
 │   ├── notification.py, audit_log.py, system_config.py
 ├── routers/          # API endpoint definitions
 │   ├── auth.py, users.py, requests.py, approvals.py
 │   ├── documents.py, reports.py, admin.py
 │   ├── system_config.py, notifications.py
 └── services/         # Business logic
     ├── notification.py
     ├── reports.py
     └── scheduler.py
```

**Key Implementation Details:**

**JWT Authentication (`dependencies.py`):**
Access tokens are signed with HS256 algorithm using a configurable secret key. The `get_current_user` dependency decodes the token, looks up the user in the database, verifies the account is active, and injects the `User` instance into the route handler. Role-based dependencies (`require_student`, `require_admin`, `require_staff_or_admin`) wrap `get_current_user` with additional role validation.

**Approval Workflow (`routers/approvals.py`):**
The `decide` endpoint accepts a request ID, decision type (approved/rejected/queried), and optional comments. It verifies that:
1. The request is at the correct stage for the current user's role.
2. The decision is valid (no approving an already-approved request).
3. The user has not already made a decision on this request.

On approval, the status advances to the next stage and the next approver is notified. On rejection/query, the status is set terminally and the student is notified. Every decision is recorded in the `approvals` table and an `audit_log` entry is created.

**Verification Checks (`routers/requests.py`):**
After a request is created (or a draft submitted), the `_run_verification` helper queries the student's fee_balance/fee_threshold and cumulative postponement years, compares against the system configuration, and sets the request to `ineligible` if either check fails. The verification logic is extracted into a shared helper to ensure consistency between submission and resubmission paths.

**Document Upload (`routers/documents.py`):**
File upload uses `python-multipart` with the following validation:
- Allowed types: `application/pdf`, `image/jpeg`, `image/png`
- Maximum size: 5,242,880 bytes (5 MB)
- Files are saved with a UUID-based filename to prevent collisions
- An `EvidenceFile` record is created with the original filename, stored filename, file type, and size
- An audit log entry is created for each upload

**Reporting (`routers/reports.py`):**
Reports are generated through database aggregation queries:
- Summary: `COUNT` with `CASE` for status breakdown
- Trends: `DATE_TRUNC('month', submitted_at)` grouped by year
- By Programme: `JOIN` students and group by `program`
- Approval Timeline: Average time between consecutive approval records
- Export: Same data rendered to CSV (csv.writer), XLSX (openpyxl with styled headers), or PDF (reportlab with landscape layout and colour-coded status rows)

#### 2.4.3 Frontend Implementation

The frontend was organised under `frontend/src/`:

```
frontend/src/
 ├── App.jsx             # Root component with providers
 ├── routes/             # Route definitions (MainRoutes, LoginRoutes)
 ├── layouts/            # Dashboard layout (Header, Drawer, Footer)
 ├── pages/              # Page components by role
 │   ├── student/        # Dashboard, NewRequest, MyRequests, RequestDetail
 │   ├── staff/          # Dashboard, Approvals, Reports, Settings
 │   ├── admin/          # Dashboard, Users, Audit, Settings
 │   └── profile/        # Profile, ChangePassword
 ├── components/         # Shared components (MainCard, SkeletonTable, ErrorBoundary)
 ├── contexts/           # React contexts (SnackbarContext)
 ├── api/                # Axios client with JWT interceptor
 ├── menu-items/         # Role-based sidebar menu definitions
 └── themes/             # MUI theme customisation
```

**Figure 2.6: Student Dashboard — Recent Requests**

The Student Dashboard displays a welcome greeting with the student's name, four KPI cards (Total Requests, Pending, Approved, Rejected), and a recent requests table showing the last 5 submissions.

**Figure 2.7: New Request Submission Form**

The New Request form collects academic year (dropdown), semester (dropdown), postponement scope (dropdown), and a detailed reason (textarea). Below the form fields is a file upload area where students can select multiple PDF/JPG/PNG files with a maximum individual size of 5 MB. Files are shown in a list with remove buttons and a total size summary. On submission:
1. The request is created via `POST /api/v1/requests/`.
2. If files were selected, they are uploaded via `POST /api/v1/documents/{request_id}/upload`.
3. A success snackbar is shown, and after 2 seconds the user is redirected to My Requests.

**Figure 2.8: Staff Approvals — Pending Requests Table**

The Staff Approvals page shows all requests awaiting the current user's decision. Each row displays student name, student number, programme, academic year, semester, scope, and submission date. An "eye" icon opens the detail dialog.

**Figure 2.9: Approval Detail Dialog with Fee Balance**

The detail dialog shows complete student information (name, number, programme, year of study, fee balance with colour-coded chip), request information (academic year, semester, scope, submission date, reason), affected modules (if scope is specific_modules), and evidence files with download buttons. Three action buttons at the bottom trigger the decision flow: Approve (green), Reject (red), Query (yellow). Each opens a confirmation dialog with optional comments.

**Figure 2.10: Reports Page with Charts**

The reports page features:
- Four KPI cards showing Total, Approved, Rejected, and Pending counts
- A pie chart visualising the distribution of request statuses
- A bar chart showing monthly request trends by academic year
- A table displaying average approval time per approver role
- A table showing request counts by programme
- Export buttons for CSV, XLSX, and PDF formats

**Figure 2.11: Settings Page — System Configuration**

The settings page displays three card sections:
- **Academic Rules:** Maximum postponement years, fee threshold
- **Approval Workflow:** HoD review hours, escalation hours
- **Evidence Rules:** Maximum number of evidence files, maximum file size

Campus Managers and Administrators can edit these values inline. HoD roles see the values in read-only mode with a badge indicating their view-only status.

#### 2.4.4 Notification System Implementation

The notification system follows a publish-subscribe pattern:

1. **NotificationService (`app/services/notification.py`):**
   - `create_notification(db, recipient_id, subject, body)`: Generic function that creates a `Notification` record with `is_read=False` and the current timestamp.
   - Role-specific wrappers: `notify_approvers_hod_academic`, `notify_approvers_hod_exams`, `notify_approvers_campus_manager`, `notify_student`, `notify_admins_escalation`.

2. **Trigger Points:**
   - Request submitted → `notify_approvers_hod_academic` (in `requests.py`)
   - HoD Academic approves → `notify_approvers_hod_exams` (in `approvals.py`)
   - HoD Examinations approves → `notify_approvers_campus_manager` (in `approvals.py`)
   - Final decision (approve/reject/query) → `notify_student` (in `approvals.py`)
   - Overdue check → `notify_admins_escalation` (in `scheduler.py` and manual endpoint)

3. **Frontend (`Notification.jsx`):**
   - Polls `GET /notifications/unread-count` every 30 seconds
   - Displays badge count on the bell icon in the header
   - Dropdown shows notifications with subject, body preview, and relative timestamp
   - Clicking a notification marks it as read via `PUT /notifications/{id}/read` and removes it from the list
   - "Mark all as read" button calls `PUT /notifications/read-all`

4. **Escalation Scheduler (`app/services/scheduler.py`):**
   - Uses APScheduler with a 15-minute interval
   - Queries for requests in pending status where `submitted_at` + `escalation_hours` has passed
   - Calls `notify_admins_escalation` for each overdue request
   - Integrated into the FastAPI lifecycle via `app.on_event("startup")` and `app.on_event("shutdown")`

### 2.5 System Testing

#### 2.5.1 Testing Methodology

The system was tested using a combination of unit testing (via Python test scripts for backend logic), integration testing (via Postman for API endpoints), and manual user acceptance testing (via the React frontend across all user roles). The testing focused on verifying:

1. Each API endpoint returns the correct HTTP status code and response structure.
2. The approval workflow progresses through all stages correctly.
3. Edge cases are handled (duplicate submissions, invalid transitions, unauthorised access).
4. Verification checks correctly flag ineligible requests.
5. The frontend renders correctly and provides appropriate feedback.

#### 2.5.2 Test Cases and Results

**Table 2.6: Test Cases — Approval Workflow**

| # | Test Case | Input | Expected Result | Actual Result | Status |
|---|-----------|-------|-----------------|---------------|--------|
| TC-01 | Student submits valid request | Academic year, semester, scope, reason | Status = pending_hod, 201 Created | Status = pending_hod | ✓ |
| TC-02 | Student submits with files | Request + 3 PDF files | Files uploaded, linked to request | Files created, listed under request | ✓ |
| TC-03 | Student saves draft | Same fields as submit | Status = draft, no notification sent | Status = draft | ✓ |
| TC-04 | Student submits draft | Call submit on draft | Status = pending_hod, verification runs | Status = pending_hod | ✓ |
| TC-05 | HoD Academic approves | Request at pending_hod | Status = pending_hod_exams, HoD Exams notified | Status advanced, notification created | ✓ |
| TC-06 | HoD Academic rejects | Request at pending_hod | Status = rejected, student notified | Status = rejected | ✓ |
| TC-07 | HoD Exams approves invalid stage | Request at pending_hod | 400 Bad Request | 400 Bad Request | ✓ |
| TC-08 | Wrong role tries to approve | Non-HoD user accesses approve | 403 Forbidden | 403 Forbidden | ✓ |
| TC-09 | Full pipeline end-to-end | Submit → HoD Academic approve → HoD Exams approve → Manager approve | Final status = approved | Status = approved | ✓ |
| TC-10 | Fee balance check fails | Set fee_balance < threshold | Status = ineligible, reason = fee_arrears | Status = ineligible | ✓ |
| TC-11 | Max postponement check fails | Set cumulative_years ≥ max | Status = ineligible, reason = max_postponements_reached | Status = ineligible | ✓ |
| TC-12 | Admin override | Ineligible request + admin note | Status = pending_hod | Status = pending_hod | ✓ |
| TC-13 | Student resubmits after rejection | Rejected request → resubmit | New child request, status = pending_hod | New request created, linked to parent | ✓ |
| TC-14 | Unauthenticated access | No token in header | 401 Unauthorized | 401 Unauthorized | ✓ |
| TC-15 | Password change | Correct current + new password | 200 OK, login with new password works | 200 OK | ✓ |

All test cases passed. The system demonstrated correct behaviour across normal workflow paths, error handling paths, and edge cases.

#### 2.5.3 Known Issues and Limitations

1. **No email delivery:** Notifications are in-app only. SMTP configuration exists but is not wired to the notification service.
2. **Student profile auto-creation:** When a student submits their first request without a pre-existing profile, a profile is auto-created with placeholder data (program, student number). This data should ideally come from the SIS.
3. **File storage on disk:** Uploaded files are stored on the server filesystem rather than in cloud object storage (S3, etc.), which may present scalability challenges.
4. **No skeleton screens on all pages:** Skeleton loading states were implemented on the two most frequently loaded pages (My Requests and Approvals) but not yet applied to all pages.

---

## Chapter 3: Conclusion and Recommendations

### 3.1 Conclusion

The SmartPost digital academic postponement management system was successfully designed, implemented, and tested. The project achieved all seven specific objectives outlined in Chapter 1:

1. A role-based online submission and approval platform was developed, supporting a three-stage sequential workflow (HoD Academic → HoD Examinations → Campus Manager) with approve, reject, and query decisions at each stage.

2. Automated verification checks were implemented for fee balance and maximum postponement years, with configurable thresholds and descriptive ineligibility reasons.

3. A document management subsystem was created, allowing students to upload supporting evidence (PDF, JPG, PNG) with file type and size validation, and enabling staff to preview and download documents during review.

4. A real-time in-app notification system was built, alerting approvers of new requests and students of status changes, with an automated escalation mechanism for overdue requests running every 15 minutes via APScheduler.

5. A reporting and analytics dashboard was developed, displaying KPI cards, status distribution pie charts, monthly trend bar charts, and programme-based breakdowns, with data export in CSV, XLSX, and PDF formats.

6. A comprehensive audit logging subsystem was implemented, recording every action with user identification, timestamps, machine-readable metadata, and IP addresses.

7. A system configuration interface was provided, allowing campus managers and administrators to adjust business rules without modifying source code, with appropriate role-based access controls.

#### 3.1.1 Major Strengths

- **Fully functional multi-role workflow:** The system correctly implements a five-role architecture with strict state machine transitions that prevent invalid workflow progression.
- **Comprehensive audit trail:** Every action in the system is logged with sufficient context to reconstruct the complete history of any request.
- **Real-time transparency:** Students can track their request status and view full timelines without contacting multiple offices.
- **Configurable business rules:** System settings can be adjusted through the UI without developer intervention.
- **Modern tech stack:** FastAPI's async architecture provides good performance, while React's component model ensures maintainable frontend code.

#### 3.1.2 Weaknesses

- **No email integration:** The system currently relies solely on in-app notifications, which require users to be logged into the platform to receive alerts.
- **No external data synchronisation:** Student records (programme, fee balance, cumulative years) must be entered manually or imported, rather than being synchronised automatically from the college's SIS.
- **No mobile optimisation:** While the UI is responsive on tablets, the experience on mobile phones has not been fully optimised.

#### 3.1.3 Benefits Derived

- The student gained practical experience in full-stack web development using modern technologies (React, FastAPI, PostgreSQL).
- The student developed skills in requirements analysis, system design, database modelling, API design, and testing methodology.
- The college will benefit from reduced paperwork, faster processing times, improved transparency, and better data for decision-making.
- The project demonstrates the practical application of computer science concepts including state machine design, role-based access control, RESTful API design, asynchronous programming, and relational database management.

### 3.2 Recommendations

1. **Email Notification Integration:** The existing SMTP configuration in `.env` should be wired to the notification service so that users receive email alerts in addition to in-app notifications. This would ensure users are notified even when they are not actively logged into the platform. The `fastapi-mail` package is already installed and configured but the service functions need to be extended.

2. **SIS Integration:** An API-based synchronisation bridge should be developed to connect SmartPost with IAA College's Student Information System. This would enable automatic updates of student fee balances, cumulative postponement years, programme enrolment, and registration status, eliminating manual data entry and reducing errors.

3. **Deployment and Infrastructure:** The application should be containerised using Docker (with separate containers for the frontend, backend, and database) and deployed to a production server with HTTPS termination. A CI/CD pipeline should be established using GitHub Actions for automated testing and deployment.

4. **Password Reset Flow:** A "forgot password" feature should be implemented that sends a time-limited reset link via email, allowing users to regain access to their accounts without administrator intervention.

5. **Mobile Responsiveness:** The frontend should be reviewed and optimised for mobile phone screen sizes, particularly the approval detail dialog, report charts, and settings page which currently have sub-optimal layouts on narrow screens.

6. **Loading States:** Skeleton loading screens should be applied to all pages that currently show simple circular progress spinners, providing a more polished user experience.

---

## References

1. Grinberg, M. (2018) *Flask Web Development: Developing Web Applications with Python*. 2nd edn. Sebastopol: O'Reilly Media.

2. Lutz, M. (2013) *Learning Python*. 5th edn. Sebastopol: O'Reilly Media.

3. Ramalho, L. (2022) *Fluent Python: Clear, Concise, and Effective Programming*. 2nd edn. Sebastopol: O'Reilly Media.

4. Severance, C. (2016) 'Python for Everybody: Exploring Data in Python 3'. Available at: https://www.py4e.com/ (Accessed: 15 January 2026).

5. FastAPI Documentation (2024) *FastAPI*. Available at: https://fastapi.tiangolo.com/ (Accessed: 20 January 2026).

6. React Documentation (2024) *React*. Available at: https://react.dev/ (Accessed: 22 January 2026).

7. Material-UI Documentation (2024) *MUI Core*. Available at: https://mui.com/material-ui/ (Accessed: 25 January 2026).

8. SQLAlchemy Documentation (2024) *SQLAlchemy 2.0*. Available at: https://docs.sqlalchemy.org/ (Accessed: 28 January 2026).

9. Passlib Documentation (2023) *Passlib: Python Password Hashing Library*. Available at: https://passlib.readthedocs.io/ (Accessed: 1 February 2026).

10. APScheduler Documentation (2023) *Advanced Python Scheduler*. Available at: https://apscheduler.readthedocs.io/ (Accessed: 10 March 2026).

11. ReportLab Documentation (2024) *ReportLab: PDF Processing with Python*. Available at: https://www.reportlab.com/docs/ (Accessed: 15 March 2026).

12. OpenPyXL Documentation (2024) *OpenPyXL: A Python library to read/write Excel files*. Available at: https://openpyxl.readthedocs.io/ (Accessed: 15 March 2026).

13. Sommerville, I. (2015) *Software Engineering*. 10th edn. Boston: Pearson Education.

14. Pressman, R.S. (2014) *Software Engineering: A Practitioner's Approach*. 8th edn. New York: McGraw-Hill Education.

15. Elmasri, R. and Navathe, S.B. (2016) *Fundamentals of Database Systems*. 7th edn. Boston: Pearson Education.

---

## Appendices

### Appendix A: Source Code Structure

The complete source code is organised as follows:

**Backend (`backend/`):**
```
backend/
 ├── app/
 │   ├── __init__.py
 │   ├── main.py
 │   ├── config.py
 │   ├── database.py
 │   ├── dependencies.py
 │   ├── models/
 │   │   ├── __init__.py
 │   │   ├── enums.py
 │   │   ├── user.py
 │   │   ├── student.py
 │   │   ├── request.py
 │   │   ├── approval.py
 │   │   ├── evidence.py
 │   │   ├── notification.py
 │   │   ├── audit_log.py
 │   │   └── system_config.py
 │   ├── routers/
 │   │   ├── __init__.py
 │   │   ├── auth.py
 │   │   ├── users.py
 │   │   ├── requests.py
 │   │   ├── approvals.py
 │   │   ├── documents.py
 │   │   ├── reports.py
 │   │   ├── admin.py
 │   │   ├── system_config.py
 │   │   └── notifications.py
 │   └── services/
 │       ├── __init__.py
 │       ├── notification.py
 │       ├── reports.py
 │       └── scheduler.py
 ├── scripts/
 │   └── seed.py
 ├── requirements.txt
 └── .env
```

**Frontend (`frontend/`):**
```
frontend/
 ├── src/
 │   ├── App.jsx
 │   ├── index.jsx
 │   ├── api/
 │   │   └── client.js
 │   ├── components/
 │   │   ├── ErrorBoundary.jsx
 │   │   ├── Loadable.jsx
 │   │   ├── MainCard.jsx
 │   │   ├── ScrollTop.jsx
 │   │   └── SkeletonTable.jsx
 │   ├── contexts/
 │   │   └── SnackbarContext.jsx
 │   ├── layouts/Dashboard/
 │   │   ├── index.jsx
 │   │   ├── Drawer/
 │   │   ├── Header/
 │   │   └── Footer/
 │   ├── menu-items/
 │   │   ├── student.jsx
 │   │   ├── staff.jsx
 │   │   └── admin.jsx
 │   ├── pages/
 │   │   ├── student/ (Dashboard, NewRequest, MyRequests, RequestDetail)
 │   │   ├── staff/ (Dashboard, Approvals, Reports, Settings)
 │   │   ├── admin/ (Dashboard, Users, Audit, Settings)
 │   │   ├── profile/ (index, ChangePassword)
 │   │   └── extra-pages/ (NotFound, sample-page)
 │   ├── routes/
 │   │   ├── index.jsx
 │   │   ├── MainRoutes.jsx
 │   │   └── LoginRoutes.jsx
 │   └── themes/
 ├── package.json
 └── vite.config.js
```

### Appendix B: API Documentation

The complete API documentation is available via the built-in FastAPI Swagger UI at `/api/docs` when the backend server is running. This provides an interactive interface for testing all endpoints, complete with request/response schemas, authentication requirements, and example values.

### Appendix C: Database Schema (DDL)

The database schema is defined programmatically through SQLAlchemy ORM models in `backend/app/models/`. Key schema details:

- All tables use UUID primary keys generated by `uuid.uuid4`.
- Foreign keys are enforced with `ON DELETE RESTRICT` or `CASCADE` as appropriate.
- The `audit_log.metadata_` column uses PostgreSQL's JSONB type (stored as `JSON` via SQLAlchemy).
- The `system_config` table uses a single row with `id = 1` enforced at the application layer.
- The `requests.parent_request_id` is a self-referential foreign key for tracking resubmissions.

### Appendix D: Environment Configuration

The system requires the following environment variables (defined in `.env`):

```
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/smartpost
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=5242880
APP_NAME=SmartPost
APP_ENV=development

# SMTP (not yet wired)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Appendix E: Seed Data

The `scripts/seed.py` script creates five default user accounts for development and testing:

| Email | Password | Role | Name |
|-------|----------|------|------|
| admin@iaacollege.ac.tz | admin123 | administrator | System Admin |
| hod.cs@iaacollege.ac.tz | staff123 | hod_academic | Dr. Smith |
| exams@iaacollege.ac.tz | staff123 | hod_examinations | Ms. Johnson |
| manager@iaacollege.ac.tz | manager123 | campus_manager | Mr. Kamau |
| student@iaacollege.ac.tz | student123 | student | Enny Mwaseba |

---

*End of Report*
