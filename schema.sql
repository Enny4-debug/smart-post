-- =============================================================
-- SmartPost Database Schema
-- IAA College — Academic Postponement Management System
-- PostgreSQL
-- =============================================================


-- ─────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────

CREATE TYPE user_role AS ENUM (
    'student',
    'hod_academic',
    'hod_examinations',
    'campus_manager',
    'administrator'
);

CREATE TYPE request_status AS ENUM (
    'draft',            -- saved but not yet submitted
    'submitted',        -- submitted, awaiting verification
    'ineligible',       -- failed verification (terminal)
    'pending_hod',      -- waiting on Academic HOD
    'pending_hod_exams',-- waiting on HOD Examinations
    'pending_manager',  -- waiting on Campus Manager
    'queried',          -- approver requested more info
    'approved',         -- fully approved (terminal)
    'rejected'          -- rejected at any stage (terminal)
);

CREATE TYPE decision_type AS ENUM (
    'approved',
    'rejected',
    'queried'           -- request more information from student
);

CREATE TYPE ineligibility_reason AS ENUM (
    'not_registered',
    'data_mismatch',
    'outstanding_fees',
    'limit_exceeded'    -- max 2 cumulative academic years
);

CREATE TYPE file_type AS ENUM (
    'pdf',
    'jpg',
    'png'
);

CREATE TYPE postponement_scope AS ENUM (
    'full_semester',     -- postpone the entire semester (all enrolled modules)
    'specific_modules'   -- postpone only selected individual modules
);

CREATE TYPE audit_action AS ENUM (
    'request_created',
    'request_submitted',
    'request_drafted',
    'verification_passed',
    'verification_failed',
    'approval_decision',
    'file_uploaded',
    'file_viewed',
    'record_viewed',
    'record_retrieved',
    'escalation_triggered',
    'reminder_sent',
    'notification_sent',
    'user_created',
    'user_updated',
    'user_deactivated',
    'rule_updated',
    'admin_override'
);


-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────

CREATE TABLE users (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   TEXT            NOT NULL,
    role            user_role       NOT NULL,
    department      VARCHAR(150),                   -- relevant for HOD roles
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Index for fast login lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);


-- ─────────────────────────────────────────
-- STUDENTS
-- Extended profile linked to a user account
-- ─────────────────────────────────────────

CREATE TABLE students (
    student_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    student_number      VARCHAR(50)     NOT NULL UNIQUE,  -- institutional ID e.g. "IAA/2023/001"
    program             VARCHAR(150)    NOT NULL,
    year_of_study       SMALLINT        NOT NULL CHECK (year_of_study BETWEEN 1 AND 10),
    fee_balance         NUMERIC(12, 2)  NOT NULL DEFAULT 0.00,
    fee_threshold       NUMERIC(12, 2)  NOT NULL DEFAULT 0.00, -- admin-configurable acceptable balance
    cumulative_postponed_years NUMERIC(3,1) NOT NULL DEFAULT 0, -- tracks total years postponed (max 2)
    synced_at           TIMESTAMPTZ,                -- last time fee/academic data was synced from source system
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_students_student_number ON students(student_number);
CREATE INDEX idx_students_user_id        ON students(user_id);


-- ─────────────────────────────────────────
-- ACADEMIC MODULES (lookup table)
-- Seeded by admin; students pick from this list
-- ─────────────────────────────────────────

CREATE TABLE modules (
    module_id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(20) NOT NULL UNIQUE,     -- e.g. "CS301"
    name        VARCHAR(200) NOT NULL,
    program     VARCHAR(150),                    -- which program this belongs to (NULL = all)
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_modules_program ON modules(program);


-- ─────────────────────────────────────────
-- POSTPONEMENT REQUESTS
-- ─────────────────────────────────────────

CREATE TABLE requests (
    request_id          UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          UUID                NOT NULL REFERENCES students(student_id) ON DELETE RESTRICT,
    academic_year       VARCHAR(10)         NOT NULL,   -- e.g. "2025/2026"
    semester            SMALLINT            NOT NULL CHECK (semester IN (1, 2)),
    reason              TEXT                NOT NULL,
    status              request_status      NOT NULL DEFAULT 'draft',

    -- Scope: full semester or individual module selection
    scope               postponement_scope  NOT NULL DEFAULT 'full_semester',
    -- When scope = 'full_semester'  → request_modules rows are auto-populated from student enrollment
    -- When scope = 'specific_modules' → student picks from request_modules; at least 1 required

    -- Submission tracking
    submitted_at        TIMESTAMPTZ,

    -- Ineligibility detail (populated by verification engine)
    ineligibility_reason    ineligibility_reason,
    ineligibility_detail    TEXT,               -- human-readable explanation
    admin_override          BOOLEAN NOT NULL DEFAULT FALSE,
    admin_override_by       UUID REFERENCES users(user_id),
    admin_override_note     TEXT,

    -- Re-submission tracking
    parent_request_id   UUID REFERENCES requests(request_id), -- if this is a re-submission after rejection
    resubmission_count  SMALLINT NOT NULL DEFAULT 0,

    -- Timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requests_student_id  ON requests(student_id);
CREATE INDEX idx_requests_status      ON requests(status);
CREATE INDEX idx_requests_submitted_at ON requests(submitted_at);
CREATE INDEX idx_requests_academic_year ON requests(academic_year);


-- ─────────────────────────────────────────
-- REQUEST ↔ MODULE (many-to-many)
-- Populated in two ways depending on scope:
--   full_semester    → app auto-inserts ALL enrolled modules on submission
--   specific_modules → student selects; at least 1 row required (enforced by trigger below)
-- ─────────────────────────────────────────

CREATE TABLE request_modules (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id  UUID    NOT NULL REFERENCES requests(request_id) ON DELETE CASCADE,
    module_id   UUID    NOT NULL REFERENCES modules(module_id)   ON DELETE RESTRICT,
    UNIQUE (request_id, module_id)
);

CREATE INDEX idx_request_modules_request_id ON request_modules(request_id);

-- Enforce: if scope = 'specific_modules', at least 1 module must be present on submission
CREATE OR REPLACE FUNCTION check_specific_modules_scope()
RETURNS TRIGGER AS $$
BEGIN
    -- Only enforce when status transitions to 'submitted'
    IF NEW.status = 'submitted' AND NEW.scope = 'specific_modules' THEN
        IF (SELECT COUNT(*) FROM request_modules WHERE request_id = NEW.request_id) = 0 THEN
            RAISE EXCEPTION 'Requests with scope ''specific_modules'' must include at least one module.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_specific_modules_scope
BEFORE UPDATE ON requests
FOR EACH ROW
WHEN (NEW.status = 'submitted')
EXECUTE FUNCTION check_specific_modules_scope();


-- ─────────────────────────────────────────
-- EVIDENCE / UPLOADED FILES
-- ─────────────────────────────────────────

CREATE TABLE evidence_files (
    evidence_id     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id      UUID        NOT NULL REFERENCES requests(request_id) ON DELETE CASCADE,
    uploaded_by     UUID        NOT NULL REFERENCES users(user_id),
    original_name   VARCHAR(255) NOT NULL,
    stored_path     TEXT        NOT NULL,    -- S3 key / MinIO path / filesystem path
    file_type       file_type   NOT NULL,
    size_bytes      INT         NOT NULL CHECK (size_bytes <= 5242880), -- 5MB max
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Soft-delete: admin can remove files without breaking audit trail
    is_deleted      BOOLEAN     NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    deleted_by      UUID        REFERENCES users(user_id)
);

CREATE INDEX idx_evidence_request_id ON evidence_files(request_id);

-- Enforce max 10 files per request via application layer (check trigger below)
CREATE OR REPLACE FUNCTION check_max_evidence_files()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM evidence_files WHERE request_id = NEW.request_id AND is_deleted = FALSE) >= 10 THEN
        RAISE EXCEPTION 'Maximum of 10 evidence files allowed per request.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_max_evidence_files
BEFORE INSERT ON evidence_files
FOR EACH ROW EXECUTE FUNCTION check_max_evidence_files();


-- ─────────────────────────────────────────
-- APPROVALS
-- One row per approver decision per request
-- ─────────────────────────────────────────

CREATE TABLE approvals (
    approval_id     UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id      UUID            NOT NULL REFERENCES requests(request_id) ON DELETE RESTRICT,
    approver_id     UUID            NOT NULL REFERENCES users(user_id),
    approver_role   user_role       NOT NULL,   -- snapshot of role at time of decision
    decision        decision_type   NOT NULL,
    comments        TEXT,
    decided_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Track escalation
    was_escalated   BOOLEAN         NOT NULL DEFAULT FALSE,
    escalated_from  UUID            REFERENCES users(user_id) -- original approver who didn't act

    -- One decision per approver role per request (no double-approving)
    -- UNIQUE(request_id, approver_role) -- uncomment if you want strict enforcement
);

CREATE INDEX idx_approvals_request_id  ON approvals(request_id);
CREATE INDEX idx_approvals_approver_id ON approvals(approver_id);


-- ─────────────────────────────────────────
-- NOTIFICATIONS
-- Channel: email only (expandable later)
-- ─────────────────────────────────────────

CREATE TABLE notifications (
    notification_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id    UUID        NOT NULL REFERENCES users(user_id),
    request_id      UUID        REFERENCES requests(request_id),

    -- Channel locked to email; extend CHECK to add 'sms' | 'in_app' when needed
    channel         VARCHAR(20) NOT NULL DEFAULT 'email' CHECK (channel IN ('email')),

    subject         VARCHAR(255) NOT NULL,
    body            TEXT         NOT NULL,

    -- Delivery tracking
    sent_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    delivered       BOOLEAN      NOT NULL DEFAULT FALSE,  -- confirmed by SMTP/provider callback
    delivery_error  TEXT,                                 -- store bounce/failure reason if any

    -- Read tracking (for future in-app use; mark TRUE on email open-pixel hit if applicable)
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ
);

CREATE INDEX idx_notifications_recipient  ON notifications(recipient_id);
CREATE INDEX idx_notifications_request    ON notifications(request_id);
CREATE INDEX idx_notifications_is_read    ON notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_delivered  ON notifications(delivered) WHERE delivered = FALSE;


-- ─────────────────────────────────────────
-- ESCALATION LOG
-- Separate from audit log for quick dashboard queries
-- ─────────────────────────────────────────

CREATE TABLE escalation_log (
    escalation_id       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id          UUID        NOT NULL REFERENCES requests(request_id),
    original_approver   UUID        NOT NULL REFERENCES users(user_id),
    escalated_to        UUID        NOT NULL REFERENCES users(user_id),
    escalated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason              TEXT        -- e.g. "No action after 72 hours"
);

CREATE INDEX idx_escalation_request_id ON escalation_log(request_id);


-- ─────────────────────────────────────────
-- AUDIT LOG (IMMUTABLE)
-- Every action on every entity recorded here.
-- Never update or delete rows from this table.
-- ─────────────────────────────────────────

CREATE TABLE audit_log (
    log_id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            REFERENCES users(user_id),   -- NULL if system action
    request_id      UUID            REFERENCES requests(request_id),
    action          audit_action    NOT NULL,
    entity_type     VARCHAR(50),    -- 'request' | 'user' | 'file' | 'rule' etc.
    entity_id       TEXT,           -- the ID of the affected entity
    metadata        JSONB,          -- flexible: store diff, IP address, old/new values, etc.
    ip_address      INET,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id      ON audit_log(user_id);
CREATE INDEX idx_audit_request_id   ON audit_log(request_id);
CREATE INDEX idx_audit_action       ON audit_log(action);
CREATE INDEX idx_audit_created_at   ON audit_log(created_at DESC);
CREATE INDEX idx_audit_entity       ON audit_log(entity_type, entity_id);

-- Prevent any updates or deletes on audit_log
CREATE OR REPLACE FUNCTION deny_audit_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log is immutable. Updates and deletes are not permitted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deny_audit_update
BEFORE UPDATE ON audit_log
FOR EACH ROW EXECUTE FUNCTION deny_audit_mutation();

CREATE TRIGGER trg_deny_audit_delete
BEFORE DELETE ON audit_log
FOR EACH ROW EXECUTE FUNCTION deny_audit_mutation();


-- ─────────────────────────────────────────
-- SYSTEM CONFIGURATION (admin-controlled rules)
-- Single-row settings table (enforced by constraint)
-- ─────────────────────────────────────────

CREATE TABLE system_config (
    id                          SMALLINT    PRIMARY KEY DEFAULT 1,
    max_postponement_years      NUMERIC(3,1) NOT NULL DEFAULT 2.0,
    fee_threshold               NUMERIC(12,2) NOT NULL DEFAULT 0.00,    -- max acceptable balance
    hod_review_hours            SMALLINT    NOT NULL DEFAULT 48,
    escalation_hours            SMALLINT    NOT NULL DEFAULT 72,
    max_evidence_files          SMALLINT    NOT NULL DEFAULT 10,
    max_evidence_size_bytes     INT         NOT NULL DEFAULT 5242880,    -- 5MB
    allowed_postponement_reasons TEXT[],   -- list of selectable reasons for the form
    updated_by                  UUID        REFERENCES users(user_id),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Enforce single row
    CONSTRAINT single_row CHECK (id = 1)
);

-- Seed default config
INSERT INTO system_config (id) VALUES (1);


-- ─────────────────────────────────────────
-- UPDATED_AT auto-maintenance triggers
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
