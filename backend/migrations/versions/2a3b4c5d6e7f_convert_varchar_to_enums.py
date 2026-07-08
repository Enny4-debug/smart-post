"""Convert varchar enum-like columns to native PostgreSQL enum types

Revision ID: 2a3b4c5d6e7f
Revises: f737c1f1c5e4
Create Date: 2026-07-08 03:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '2a3b4c5d6e7f'
down_revision = 'f737c1f1c5e4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # NOTE: BACKUP YOUR DATABASE BEFORE RUNNING THIS MIGRATION.
    # The statements cast existing text values to the DB enum types.
    op.execute("""
    ALTER TABLE users
      ALTER COLUMN role TYPE user_role
      USING role::user_role;
    """)

    op.execute("""
    ALTER TABLE approvals
      ALTER COLUMN approver_role TYPE user_role
      USING approver_role::user_role;
    """)

    op.execute("""
    ALTER TABLE approvals
      ALTER COLUMN decision TYPE decision_type
      USING decision::decision_type;
    """)

    op.execute("""
    ALTER TABLE audit_log
      ALTER COLUMN action TYPE audit_action
      USING action::audit_action;
    """)

    # If your requests table still stores enum-like strings, convert them as well.
    op.execute("""
    ALTER TABLE requests
      ALTER COLUMN status TYPE request_status
      USING status::request_status;
    """)

    op.execute("""
    ALTER TABLE requests
      ALTER COLUMN scope TYPE postponement_scope
      USING scope::postponement_scope;
    """)

    op.execute("""
    ALTER TABLE requests
      ALTER COLUMN ineligibility_reason TYPE ineligibility_reason
      USING ineligibility_reason::ineligibility_reason;
    """)


def downgrade() -> None:
    # Revert enum columns back to text. This will convert enum values to text.
    op.execute("""
    ALTER TABLE requests
      ALTER COLUMN ineligibility_reason TYPE VARCHAR
      USING ineligibility_reason::text;
    """)

    op.execute("""
    ALTER TABLE requests
      ALTER COLUMN scope TYPE VARCHAR
      USING scope::text;
    """)

    op.execute("""
    ALTER TABLE requests
      ALTER COLUMN status TYPE VARCHAR
      USING status::text;
    """)

    op.execute("""
    ALTER TABLE audit_log
      ALTER COLUMN action TYPE VARCHAR
      USING action::text;
    """)

    op.execute("""
    ALTER TABLE approvals
      ALTER COLUMN decision TYPE VARCHAR
      USING decision::text;
    """)

    op.execute("""
    ALTER TABLE approvals
      ALTER COLUMN approver_role TYPE VARCHAR
      USING approver_role::text;
    """)

    op.execute("""
    ALTER TABLE users
      ALTER COLUMN role TYPE VARCHAR
      USING role::text;
    """)
