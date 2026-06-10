# SmartPost — Database Explained in Plain English
**For: Non-Technical Stakeholders, College Administration, Project Managers**
**System: IAA College Academic Postponement Management**

---

> **What is a database?**
> Think of the database as a collection of organised filing cabinets. Each "table" is one cabinet with clearly labelled folders. Every row in a table is one record — like one physical form stored in that cabinet. The database makes sure nothing gets lost, nothing gets changed without a record of it, and everything can be found quickly.

---

## Overview — What Information Does SmartPost Store?

SmartPost keeps track of **11 categories of information**, each in its own organised section:

| # | Section | What it holds |
|---|---|---|
| 1 | **Users** | Everyone who can log into the system |
| 2 | **Students** | Extra academic details about student users |
| 3 | **Modules** | The list of courses/subjects available at the college |
| 4 | **Requests** | Every postponement application ever submitted |
| 5 | **Request Modules** | Which specific modules are included in a request |
| 6 | **Evidence Files** | Supporting documents uploaded by students |
| 7 | **Approvals** | Every decision made by an approver on a request |
| 8 | **Notifications** | Every email the system has ever sent |
| 9 | **Escalation Log** | Cases where an approver didn't act in time |
| 10 | **Audit Log** | A permanent record of every single action taken in the system |
| 11 | **System Configuration** | The rules that govern how the system behaves |

---

## Section 1 — Users
### *"The Staff & Student Directory"*

This is the master list of every person who can log into SmartPost. Think of it like a staff/student register.

**What is stored for each person:**
- Their full name and email address
- A securely stored password (it is never stored as plain text)
- Their **role** — what type of user they are (see roles below)
- Their department (relevant for academic staff)
- Whether their account is currently **active** or has been disabled
- The date and time they last logged in

**The five types of users (roles):**

| Role | Who they are |
|---|---|
| **Student** | The person applying for postponement |
| **Academic HOD** | Head of Department — first person to review a request |
| **HOD Examinations** | Examinations department head — second reviewer |
| **Campus Manager** | Final decision-maker |
| **Administrator** | Manages the system, users, and settings |

> 🔑 Every person in the system has exactly **one role**. A person cannot be both a student and an administrator at the same time.

---

## Section 2 — Students
### *"The Student Academic Profile"*

Not everyone in the system is a student, so student-specific information is kept separately. Think of this as an **extension card** attached to a student's user record.

**What is stored:**
- Their official **student number** (e.g. IAA/2023/001)
- Their **programme** (e.g. Bachelor of Business Administration)
- Their **current year of study**
- Their **fee balance** — how much they currently owe the college
- The **total number of years** they have already postponed (maximum allowed is 2 years)
- The **last time** their fee and academic data was refreshed from the college's main systems

> 💡 The fee balance is checked automatically every time a student submits a postponement request. If they owe more than the allowed threshold, the request is blocked.

---

## Section 3 — Modules
### *"The Course Catalogue"*

This is the college's list of all courses/subjects that can be postponed. It is set up and maintained by the Administrator.

**What is stored for each module:**
- A short **code** (e.g. CS301, BUS201)
- The full **name** of the module
- Which **programme** it belongs to (some modules may apply to all programmes)
- Whether the module is currently **active** (inactive modules won't appear on forms)

> 📚 Students do not type module names manually. They select from this pre-approved list, which prevents spelling errors and invalid entries.

---

## Section 4 — Requests
### *"The Postponement Application Form"*

This is the heart of the system. Every time a student submits a postponement application, one record is created here. It follows the application from start to finish.

**What is stored:**
- Which **student** submitted it
- The **academic year** they want to postpone (e.g. 2025/2026)
- The **semester** (Semester 1 or Semester 2)
- The written **reason** for the postponement
- The current **status** of the request (see below)
- Whether the student is postponing a **full semester** or only **specific modules**
- The date and time it was **submitted**
- If the request was **blocked** by the verification check, the reason why
- Whether an **administrator overrode** a failed verification (with a note explaining why)
- If this is a **re-submission** after a rejection, a link to the original request

**The journey of a request — Status stages:**

```
DRAFT
  │  (Student saves but hasn't submitted yet)
  ▼
SUBMITTED
  │  (Student clicks submit — system checks eligibility)
  ├──► INELIGIBLE  ✗  (Failed eligibility check — student is notified)
  │
  ▼
PENDING HOD
  │  (Academic Head of Department is reviewing)
  ├──► QUERIED  ↩  (HOD asks student for more info)
  ├──► REJECTED  ✗  (HOD rejects it — student is notified)
  ▼
PENDING HOD EXAMINATIONS
  │  (Examinations HOD is reviewing)
  ├──► QUERIED  ↩  (HOD Exams asks for more info)
  ├──► REJECTED  ✗  (Rejected at this stage)
  ▼
PENDING CAMPUS MANAGER
  │  (Campus Manager gives final decision)
  ├──► REJECTED  ✗  (Final rejection)
  ▼
APPROVED  ✓  (Fully approved — student notified, records updated)
```

---

## Section 5 — Request Modules
### *"Which Courses Are Being Postponed"*

This section records exactly which modules are included in a postponement request.

**Two ways this works:**

| Postponement Type | How modules are recorded |
|---|---|
| **Full Semester** | The system automatically includes all modules the student is enrolled in for that semester |
| **Specific Modules** | The student manually selects which modules to postpone; at least one must be selected |

> 📋 This exists as a separate section (rather than just a text field) so that reports can accurately show, for example, "how many students postponed CS301 this year."

---

## Section 6 — Evidence Files
### *"Supporting Documents"*

When a student submits a request, they can attach supporting documents — for example, a medical certificate, a court letter, or a letter from an employer.

**What is stored for each file:**
- The **original filename** the student used
- The **secure location** where the file is stored on the server
- The **file type** (only PDF, JPG, or PNG are accepted)
- The **file size** (maximum 5MB per file; up to 10 files per request)
- Who **uploaded** it and when
- Whether the file has been **removed** (even removed files leave a trace in the system so the audit trail stays intact)

> 🔒 Files are stored securely. Approvers access them through the system — they cannot directly access the file storage location.

---

## Section 7 — Approvals
### *"The Decision Record"*

Every time an approver (HOD, HOD Examinations, or Campus Manager) makes a decision on a request, a record is saved here. This creates a clear, permanent history of who decided what and when.

**What is stored:**
- Which **request** the decision is about
- Which **approver** made the decision
- Their **role** at the time of the decision (saved permanently, even if their role later changes)
- The **decision** — Approved, Rejected, or Queried
- Any **written comments** they added
- The exact **date and time** of the decision
- Whether this decision happened because the original approver **didn't act in time** (escalation)

---

## Section 8 — Notifications
### *"The Email Log"*

Every email the system sends is recorded here. This allows the college to check whether a student or approver actually received a notification.

**What is stored:**
- Who the email was **sent to**
- Which **request** the email was about (if applicable)
- The email **subject line** and **full body text**
- When it was **sent**
- Whether it was **successfully delivered** (or if it bounced, the error reason is saved)
- Whether the recipient has **read** it

> 📧 The system currently sends email only. SMS and in-app notifications can be added in the future without changing the structure.

---

## Section 9 — Escalation Log
### *"When an Approver Didn't Act in Time"*

If an approver does not take action within the allowed time window, the system automatically escalates the request. This section keeps a record of every escalation.

**The escalation timeline:**
- After **48 hours** of no action → a reminder email is sent to the approver
- After **72 hours** of no action → the request is escalated to the next authority

**What is stored:**
- Which **request** was escalated
- The **original approver** who did not act
- Who the request was **escalated to**
- The **date and time** of the escalation
- The **reason** (e.g. "No action after 72 hours")

---

## Section 10 — Audit Log
### *"The Permanent Record of Everything"*

This is the most important section from a governance and compliance perspective. **Every single action taken in SmartPost is recorded here — permanently.** Nothing in this log can ever be edited or deleted, even by an administrator.

**Examples of what gets recorded:**
- A student submitted a request
- An approver viewed a document
- An administrator changed a system rule
- A file was deleted
- A user's account was deactivated
- A verification check failed

**What is stored for each entry:**
- **Who** did it (or "System" if it was automated)
- **Which request** it relates to (if applicable)
- **What action** was taken (from a fixed list of action types)
- **Which record** was affected
- Any **additional details** (e.g. old value vs new value, the user's IP address)
- The exact **date and time**

> ⚠️ **This log is immutable.** The system is built so that not even a database administrator can alter or delete audit entries. This ensures full accountability and supports compliance requirements.

---

## Section 11 — System Configuration
### *"The Rules Engine"*

This is a single set of settings that controls how the entire system behaves. Only the Administrator can change these settings, and every change is recorded in the Audit Log.

**The configurable rules:**

| Setting | Default Value | Meaning |
|---|---|---|
| **Maximum postponement years** | 2 years | A student cannot postpone for more than this total across their academic career |
| **Fee balance threshold** | 0.00 | Maximum outstanding balance allowed when submitting a request |
| **Approver review window** | 48 hours | How long an approver has before a reminder is sent |
| **Escalation window** | 72 hours | How long before the request is escalated to the next authority |
| **Max evidence files** | 10 files | Maximum number of documents a student can attach |
| **Max file size** | 5 MB | Maximum size of each uploaded file |
| **Allowed postponement reasons** | (list) | The selectable reasons shown on the student request form |

> 🛠️ Changing any of these values takes effect immediately across the entire system — no technical changes are needed.

---

## How Everything Connects

Here is a simple picture of how the sections relate to each other:

```
USER ──────────────────► STUDENT
 │                           │
 │                           └──► REQUEST ──────────────► REQUEST MODULES ──► MODULE
 │                                    │
 │                                    ├──► EVIDENCE FILES
 │                                    │
 │                                    ├──► APPROVALS ◄──── USER (as approver)
 │                                    │
 │                                    ├──► NOTIFICATIONS ──► USER (as recipient)
 │                                    │
 │                                    └──► ESCALATION LOG
 │
 └──────────────────────────────────────────────────────► AUDIT LOG
                                                               ▲
                                              (every section feeds into this)
```

**In plain words:**
- A **User** who is a student has a **Student** profile
- A **Student** submits a **Request**
- A **Request** contains **Evidence Files** and **Request Modules**
- A **Request** goes through multiple **Approvals** by different **Users**
- The system sends **Notifications** to **Users** at every stage
- If an approver is too slow, an **Escalation** is recorded
- **Every action** across all sections is permanently saved in the **Audit Log**
- The **System Configuration** controls the rules that govern all of the above

---

## Key Protections Built Into the System

| Protection | How it works |
|---|---|
| **Students can't skip eligibility** | The system checks 4 criteria automatically before routing any request for approval |
| **Students can't bypass the approval chain** | Approvals must happen in strict order: HOD → HOD Exams → Campus Manager |
| **Approvers can't sit on requests** | Automatic reminders and escalation after set time windows |
| **Files can't be silently deleted** | Even deleted files leave a permanent trace |
| **Business rules can't be hardcoded** | All key thresholds are in the System Configuration — adjustable without IT involvement |
| **Nothing in the audit log can be erased** | The database itself enforces this — it is not just a policy |
| **No duplicate module selection** | A module cannot be added to the same request twice |

---

*Document prepared by: SmartPost Development Team*
*Last updated: June 2026*
