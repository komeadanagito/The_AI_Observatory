"""add_mbti_sessions

Revision ID: 5f2c4dd0c3a1
Revises: 0bacc69fd7b5
Create Date: 2026-04-15 23:59:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "5f2c4dd0c3a1"
down_revision: Union[str, Sequence[str], None] = "0bacc69fd7b5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "mbti_sessions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("question_count", sa.Integer(), nullable=False),
        sa.Column(
            "answers_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False
        ),
        sa.Column(
            "current_question_json",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column(
            "result_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_mbti_sessions_user_status_updated",
        "mbti_sessions",
        ["user_id", "status", "updated_at"],
        unique=False,
    )
    op.create_index(
        op.f("ix_mbti_sessions_user_id"), "mbti_sessions", ["user_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_mbti_sessions_user_id"), table_name="mbti_sessions")
    op.drop_index("ix_mbti_sessions_user_status_updated", table_name="mbti_sessions")
    op.drop_table("mbti_sessions")
