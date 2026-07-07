# SmartPost — Presentation Demo Data Setup

Run this SQL to flush all existing data and seed fresh demo records for the presentation.

---

## Step 1: Truncate all dependent tables

```sql
TRUNCATE TABLE
  audit_log,
  escalation_log,
  notifications,
  approvals,
  evidence_files,
  request_modules,
  requests
RESTART IDENTITY CASCADE;
```

> This clears all requests, approvals, notifications, evidence files, and audit logs while preserving users and students.

---

## Step 2: Seed students (if not already present)

Run only if `students` table is empty:

```sql
INSERT INTO students (student_id, user_id, student_number, program, year_of_study, fee_balance, fee_threshold, cumulative_postponed_years)
SELECT
  gen_random_uuid(),
  u.user_id,
  'STU-00' || row_number() OVER () || '-24',
  CASE row_number() OVER ()
    WHEN 1 THEN 'BSc Computer Science'
    WHEN 2 THEN 'BSc Information Technology'
    WHEN 3 THEN 'BBA Marketing'
    WHEN 4 THEN 'BSc Computer Science'
    ELSE 'BSc Computer Science'
  END,
  CASE row_number() OVER ()
    WHEN 1 THEN 2
    WHEN 2 THEN 1
    WHEN 3 THEN 3
    WHEN 4 THEN 2
    ELSE 1
  END,
  CASE row_number() OVER ()
    WHEN 1 THEN 450000.00
    WHEN 2 THEN   5000.00   -- below threshold → fee_arrears risk
    WHEN 3 THEN 320000.00
    WHEN 4 THEN 600000.00
    ELSE 400000.00
  END,
  100000.00,  -- default fee_threshold
  CASE row_number() OVER ()
    WHEN 1 THEN 0.0
    WHEN 2 THEN 0.0
    WHEN 3 THEN 2.5         -- at max → max_postponements_reached risk
    WHEN 4 THEN 0.0
    ELSE 0.0
  END
FROM users u
WHERE u.role = 'student'
  AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.user_id);
```

---

## Step 3: Create demo requests

This creates **8 requests** across 4 students with varied statuses:

| # | Student | Year | Sem | Status | Submitted |
|---|---------|------|-----|--------|-----------|
| 1 | Enny Mwaseba | 2025/2026 | 1 | ✅ approved | 2026-03-10 |
| 2 | Enny Mwaseba | 2025/2026 | 2 | ✅ approved | 2026-04-05 |
| 3 | Enny Mwaseba | 2026/2027 | 1 | 🔄 pending_hod | *(live demo)* |
| 4 | Student 2 | 2025/2026 | 1 | ✅ approved | 2026-03-15 |
| 5 | Student 2 | 2026/2027 | 1 | ❌ rejected | 2026-05-01 |
| 6 | Student 3 | 2025/2026 | 2 | ✅ approved | 2026-02-20 |
| 7 | Student 4 | 2025/2026 | 1 | ✅ approved | 2026-01-15 |
| 8 | Student 4 | 2025/2026 | 2 | ⚠️ ineligible | 2026-06-01 |

Run this PL/pgSQL block:

```sql
DO $$
DECLARE
  rec RECORD;
  req_id UUID;
  i INT;
  statuses TEXT[] := ARRAY['approved','approved','pending_hod','approved','rejected','approved','approved','ineligible'];
  years TEXT[] := ARRAY['2025/2026','2025/2026','2026/2027','2025/2026','2026/2027','2025/2026','2025/2026','2025/2026'];
  sems INT[] := ARRAY[1,2,1,1,1,2,1,2];
  reasons TEXT[] := ARRAY[
    'Medical appointment — surgery recovery',
    'Family financial difficulties',
    'Medical — ongoing treatment',
    'Sponsor letter pending',
    'Personal reasons',
    'Attachment placement conflict',
    'Medical report',
    'Fee clearance pending'
  ];
  submitted_ats TIMESTAMPTZ[] := ARRAY[
    '2026-03-10 09:00:00+03',
    '2026-04-05 10:30:00+03',
    NULL,
    '2026-03-15 11:00:00+03',
    '2026-05-01 08:45:00+03',
    '2026-02-20 14:00:00+03',
    '2026-01-15 09:30:00+03',
    '2026-06-01 10:00:00+03'
  ];
BEGIN
  i := 1;
  FOR rec IN
    SELECT s.student_id, u.name
    FROM students s
    JOIN users u ON u.user_id = s.user_id
    WHERE u.role = 'student'
    ORDER BY u.name
  LOOP
    CONTINUE WHEN i > 8;

    INSERT INTO requests (request_id, student_id, academic_year, semester, reason, scope, status, submitted_at, created_at)
    VALUES (
      gen_random_uuid(),
      rec.student_id,
      years[i],
      sems[i],
      reasons[i],
      'full_semester',
      statuses[i],
      submitted_ats[i],
      COALESCE(submitted_ats[i], NOW())
    )
    RETURNING request_id INTO req_id;

    -- Create approvals for approved requests
    IF statuses[i] = 'approved' THEN
      INSERT INTO approvals (approval_id, request_id, approver_role, decision, comments, decided_at)
      VALUES
        (gen_random_uuid(), req_id, 'hod_academic', 'approved', 'Approved — valid medical documentation provided.', submitted_ats[i] + INTERVAL '2 hours'),
        (gen_random_uuid(), req_id, 'hod_examinations', 'approved', 'Noted, no exam conflicts.', submitted_ats[i] + INTERVAL '1 day'),
        (gen_random_uuid(), req_id, 'campus_manager', 'approved', 'Approved as per policy.', submitted_ats[i] + INTERVAL '2 days');
    END IF;

    -- Create rejection approval
    IF statuses[i] = 'rejected' THEN
      INSERT INTO approvals (approval_id, request_id, approver_role, decision, comments, decided_at)
      VALUES
        (gen_random_uuid(), req_id, 'hod_academic', 'rejected', 'Incomplete documentation — please provide sponsor letter.', submitted_ats[i] + INTERVAL '4 hours');
    END IF;

    -- Set ineligibility reason
    IF statuses[i] = 'ineligible' THEN
      UPDATE requests SET ineligibility_reason = 'fee_arrears', ineligibility_detail = 'Outstanding fee balance exceeds the allowed threshold.' WHERE request_id = req_id;
    END IF;

    -- Write audit log entries
    IF submitted_ats[i] IS NOT NULL THEN
      INSERT INTO audit_log (log_id, user_id, request_id, action, entity_type, entity_id, created_at)
      SELECT gen_random_uuid(), s.user_id, req_id, 'request_created', 'request', req_id::text, submitted_ats[i]
      FROM students s WHERE s.student_id = rec.student_id;
    END IF;

    i := i + 1;
  END LOOP;
END $$;
```

---

## Step 4: Verify the data

Check counts:

```sql
SELECT status, COUNT(*) FROM requests GROUP BY status ORDER BY status;
```

Expected output:

| status | count |
|--------|-------|
| approved | 5 |
| ineligible | 1 |
| pending_hod | 1 |
| rejected | 1 |

Approvals per request:

```sql
SELECT r.status, COUNT(a.approval_id) AS approval_count
FROM requests r
LEFT JOIN approvals a ON a.request_id = r.request_id
GROUP BY r.status
ORDER BY r.status;
```

---

## How to present the flow

### 1. Show the dashboard (stats)
- Open `/staff/dashboard` as HoD Academic
- KPI cards show: Total 8, Pending 0 (HoD Academic sees requests at `pending_hod` only)
- Switch to Admin view: totals appear correctly

### 2. Live demo — submit a new request
- Log in as **student@iaacollege.ac.tz** / `student123`
- Go to `/student/new-request`
- Submit a new request → status becomes `pending_hod`
- Dashboard now shows Pending: 1

### 3. Approve as HoD Academic
- Log in as **hod.cs@iaacollege.ac.tz** / `staff123`
- Go to `/staff/approvals` → the new request appears
- Click detail → view student info, fee balance chip
- **Approve** with a comment
- Request advances to `pending_hod_exams`

### 4. Approve as HoD Examinations
- Log in as **exams@iaacollege.ac.tz** / `staff123`
- Go to `/staff/approvals` → request appears
- Approve → advances to `pending_manager`

### 5. Final approve as Campus Manager
- Log in as **manager@iaacollege.ac.tz** / `manager123`
- Approve → status becomes `approved`

### 6. Show reports
- Log in as admin or any staff
- `/staff/reports` → see updated charts and KPIs
- Export to PDF/XLSX/CSV

### 7. Show audit trail
- Log in as **admin@iaacollege.ac.tz** / `admin123`
- `/admin/audit` → see all logged actions with timestamps

---

## Quick reset (during presentation)

To reset only the live-demo request without affecting seed data:

```sql
DELETE FROM approvals WHERE request_id IN (
  SELECT request_id FROM requests WHERE status IN ('pending_hod','pending_hod_exams','pending_manager','queried')
);
DELETE FROM evidence_files WHERE request_id IN (
  SELECT request_id FROM requests WHERE status IN ('pending_hod','pending_hod_exams','pending_manager','queried')
);
DELETE FROM audit_log WHERE request_id IN (
  SELECT request_id FROM requests WHERE status IN ('pending_hod','pending_hod_exams','pending_manager','queried')
);
DELETE FROM requests WHERE status IN ('pending_hod','pending_hod_exams','pending_manager','queried');
```
