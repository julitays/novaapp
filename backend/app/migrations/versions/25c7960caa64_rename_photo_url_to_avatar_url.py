"""rename photo_url to avatar_url

Revision ID: 25c7960caa64
Revises: 46a41d03a3ff
Create Date: 2025-09-12 17:02:57.525551

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '25c7960caa64'
down_revision: Union[str, None] = '46a41d03a3ff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
