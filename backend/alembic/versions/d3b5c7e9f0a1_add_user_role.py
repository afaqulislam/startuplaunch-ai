"""Add role to users

Revision ID: d3b5c7e9f0a1
Revises: b1b2c3d4e5f7
Create Date: 2026-09-19 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd3b5c7e9f0a1'
down_revision: Union[str, Sequence[str], None] = 'b1b2c3d4e5f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'users',
        sa.Column(
            'role',
            sa.String(),
            nullable=False,
            # Existing rows start with the least-privileged role. Admins are
            # promoted via ADMIN_EMAILS at startup.
            server_default='user',
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'role')