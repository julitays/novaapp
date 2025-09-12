"""rename photo_url to avatar_url

Revision ID: 462ef0cf717f
Revises: 46a41d03a3ff
Create Date: 2025-09-12 17:08:00.767532

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '462ef0cf717f'
down_revision: Union[str, None] = '46a41d03a3ff'
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
