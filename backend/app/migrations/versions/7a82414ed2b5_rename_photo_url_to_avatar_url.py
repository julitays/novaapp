"""rename photo_url to avatar_url

Revision ID: 7a82414ed2b5
Revises: 25c7960caa64
Create Date: 2025-09-12 17:03:46.865143

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a82414ed2b5'
down_revision: Union[str, None] = '25c7960caa64'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "employees",
        "photo_url",
        new_column_name="avatar_url",
    )

def downgrade() -> None:
    op.alter_column(
        "employees",
        "avatar_url",
        new_column_name="photo_url",
    )
