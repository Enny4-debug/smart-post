CREATE OR REPLACE FUNCTION check_specific_modules_scope()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved_hod' AND OLD.scope = 'specific_modules' THEN
        INSERT INTO notifications (user_id, message, reference_type, reference_id)
        SELECT user_id, 'Your postponement request for specific modules has been approved by HOD.',
               'request', NEW.request_id
        FROM requests WHERE request_id = NEW.request_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_specific_modules_scope
AFTER UPDATE OF status ON requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION check_specific_modules_scope();

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
