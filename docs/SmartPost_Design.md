# SmartPost — System Design Document
**IAA College Digital Academic Postponement Management System**

---

## 1. System Overview

SmartPost is a web-based system that digitizes the academic postponement request lifecycle — from student submission through multi-level approval to archiving and reporting.

```mermaid
graph TD
    A[Student] -->|Submits Request| B[SmartPost System]
    B --> C[Verification Engine]
    C -->|Eligible| D[Approval Workflow]
    C -->|Ineligible| E[Rejection Notice to Student]
    D --> F[Document Store]
    D --> G[Notifications]
    F --> H[Reporting & Analytics]
    I[Administrator] --> J[Admin Panel]
    J --> B
```

---

## 2. User Roles

| Role | Permissions |
|---|---|
| Student | Submit requests, upload evidence, track status |
| Academic HOD | Review, comment, approve/reject requests |
| HOD Examinations | Second-level review and approval |
| Campus Manager | Final approval authority |
| Administrator | Configure rules, manage users, view audit logs |

---

## 3. Student Request Subsystem

Students authenticate and submit postponement requests with supporting evidence.

```mermaid
flowchart TD
    A([Start]) --> B[Student Logs In]
    B --> C{Authenticated?}
    C -->|No| D[Show Login Error]
    D --> B
    C -->|Yes| E[Load Student Profile]
    E --> F[Fill Postponement Form]
    F --> G[Select: Academic Year / Semester / Modules]
    G --> H[Enter Reason for Postponement]
    H --> I[Upload Supporting Evidence]
    I --> J{All required fields filled?}
    J -->|No| K[Highlight Missing Fields]
    K --> F
    J -->|Yes| L[Submit Request]
    L --> M[System Assigns Request ID]
    M --> N[Confirmation Sent to Student]
    N --> O([End])
```

---

## 4. Verification Subsystem

Before routing for approval, the system automatically validates student eligibility.

```mermaid
flowchart TD
    A([Request Received]) --> B[Fetch Student Record from Academic DB]
    B --> C{Student Registered?}
    C -->|No| D[Flag: Not Registered]
    C -->|Yes| E{Program & Year Match?}
    E -->|No| F[Flag: Data Mismatch]
    E -->|Yes| G{Fee Balance Cleared?}
    G -->|No| H[Flag: Outstanding Fees]
    G -->|Yes| I{Within Max Postponement Limit?}
    I -->|No| J[Flag: Limit Exceeded - max 2 years]
    I -->|Yes| K[Mark Request as ELIGIBLE]
    D & F & H & J --> L[Notify Student of Ineligibility with Reason]
    K --> M[Route to Approval Workflow]
```

---

## 5. Approval Workflow Subsystem

Requests move sequentially through three approval levels. Each level can approve, reject, or request more information.

```mermaid
sequenceDiagram
    participant S as Student
    participant SYS as System
    participant HOD as Academic HOD
    participant HODE as HOD Examinations
    participant CM as Campus Manager

    S->>SYS: Submit Request
    SYS->>SYS: Verify Eligibility
    SYS->>HOD: Notify: New Request Pending
    HOD->>SYS: Review & Decision (Approve / Reject / Query)
    alt Rejected or Queried
        SYS->>S: Notify with HOD Comments
    else Approved
        SYS->>HODE: Notify: Request Pending Review
        HODE->>SYS: Review & Decision
        alt Rejected or Queried
            SYS->>S: Notify with HODE Comments
        else Approved
            SYS->>CM: Notify: Final Approval Needed
            CM->>SYS: Final Decision
            alt Rejected
                SYS->>S: Notify: Final Rejection with Reason
            else Approved
                SYS->>S: Notify: Request APPROVED
                SYS->>SYS: Update Academic Records
                SYS->>SYS: Archive Request & Documents
            end
        end
    end
```

### Escalation Logic

```mermaid
flowchart TD
    A[Request Assigned to Approver] --> B{Action Taken within 48hrs?}
    B -->|Yes| C[Normal Flow Continues]
    B -->|No| D[Send Reminder Notification]
    D --> E{Action Taken within 24hrs?}
    E -->|Yes| C
    E -->|No| F[Escalate to Next Authority]
    F --> G[Log Escalation in Audit Trail]
```

---

## 6. Document Management Subsystem

```mermaid
flowchart TD
    A[Request Submitted] --> B[Store Form Data in DB]
    A --> C[Upload Evidence Files]
    C --> D{File Validation}
    D -->|Invalid type/size| E[Reject File - Notify Student]
    D -->|Valid| F[Store in Secure File Storage]
    F --> G[Link Files to Request ID]
    B & G --> H[Audit Log Entry Created]
    H --> I[Timestamp + User + Action Recorded]

    J[Approver Reviews] --> K[Access Request + Files via Request ID]
    K --> L[Audit Log: Viewed by Approver]

    M[Admin Compliance Check] --> N[Search by Student / Date / Status]
    N --> O[Retrieve Full Request Record]
    O --> P[Audit Log: Retrieved by Admin]
```

---

## 7. Reporting & Analytics Subsystem

```mermaid
flowchart TD
    A[Admin / Academic Staff] --> B[Access Reports Dashboard]
    B --> C{Report Type}
    C --> D[Postponements by Department]
    C --> E[Postponements by Reason]
    C --> F[Approval Timeline Report]
    C --> G[Pending Requests Report]
    C --> H[Trend Analysis - Monthly/Yearly]
    D & E & F & G & H --> I[Generate Report]
    I --> J{Export Format}
    J --> K[PDF]
    J --> L[Excel/CSV]
    I --> M[Display Charts & Stats on Dashboard]
```

---

## 8. Administration Subsystem

```mermaid
flowchart TD
    A[Administrator Logs In] --> B[Admin Dashboard]
    B --> C{Action}
    C --> D[Manage Users]
    C --> E[Configure Rules]
    C --> F[View Audit Logs]
    C --> G[Monitor System Activity]

    D --> D1[Create / Edit / Deactivate User]
    D1 --> D2[Assign Role: Student / HOD / Manager / Admin]

    E --> E1[Set Max Postponement Period]
    E --> E2[Set Allowed Postponement Reasons]
    E --> E3[Configure Approval Chain Order]
    E --> E4[Set Escalation Timeouts]

    F --> F1[Filter by User / Date / Action]
    F1 --> F2[View Full Audit Trail]

    G --> G1[View Active Requests]
    G --> G2[View System Health Stats]
```

---

## 9. Full System Data Flow

```mermaid
flowchart LR
    subgraph Student Side
        A[Student Portal]
    end

    subgraph Core System
        B[Auth Service]
        C[Request Service]
        D[Verification Service]
        E[Workflow Engine]
        F[Notification Service]
        G[Document Service]
    end

    subgraph Data Layer
        H[(Academic DB)]
        I[(Request DB)]
        J[(File Storage)]
        K[(Audit Log DB)]
    end

    subgraph Staff Side
        L[Approver Portal]
        M[Admin Panel]
        N[Reports Dashboard]
    end

    A --> B --> C
    C --> D --> H
    D --> E
    E --> F --> A
    E --> F --> L
    C --> G --> J
    C --> I
    E --> K
    G --> K
    L --> E
    M --> B
    M --> K
    N --> I
    N --> K
```

---

## 10. Database Entity Overview

```mermaid
erDiagram
    STUDENT {
        string student_id PK
        string name
        string email
        string program
        int year_of_study
        float fee_balance
    }

    REQUEST {
        string request_id PK
        string student_id FK
        string academic_year
        string semester
        string modules
        string reason
        string status
        datetime submitted_at
    }

    EVIDENCE {
        string evidence_id PK
        string request_id FK
        string file_path
        string file_type
        datetime uploaded_at
    }

    APPROVAL {
        string approval_id PK
        string request_id FK
        string approver_id FK
        string role
        string decision
        string comments
        datetime decided_at
    }

    USER {
        string user_id PK
        string name
        string email
        string role
        boolean is_active
    }

    AUDIT_LOG {
        string log_id PK
        string user_id FK
        string request_id FK
        string action
        datetime timestamp
    }

    STUDENT ||--o{ REQUEST : submits
    REQUEST ||--o{ EVIDENCE : has
    REQUEST ||--o{ APPROVAL : goes_through
    USER ||--o{ APPROVAL : makes
    USER ||--o{ AUDIT_LOG : generates
    REQUEST ||--o{ AUDIT_LOG : tracked_in
```

---

## 11. Key Business Rules

- A student may not postpone for more than **2 cumulative academic years**
- Fee balance must be **zero or within approved threshold** to submit
- Approval must follow the fixed sequence: **HOD → HOD Exams → Campus Manager**
- Approvers have **48 hours** to act before a reminder is sent, **72 hours** before escalation
- Supported evidence file types: **PDF, JPG, PNG** — max **5MB per file**
- All actions are **immutably logged** in the audit trail
