"""Added Vendor.

Revision ID: 7b30102a9884
Revises: e0ff61284e9d
Create Date: 2023-11-17 14:34:30.819942

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7b30102a9884'
down_revision: Union[str, None] = 'e0ff61284e9d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('vendors',
                    sa.Column('vendor_id', sa.Integer(), autoincrement=True, nullable=False),
                    sa.Column('vendor_name', sa.String(length=255), nullable=False),
                    sa.Column('vendor_address', sa.String(length=255), nullable=True),
                    sa.Column('vendor_owner_id', sa.Integer(), nullable=False),
                    sa.Column('is_government', sa.Boolean(), nullable=False),
                    sa.ForeignKeyConstraint(['vendor_owner_id'], ['users.user_id'], ),
                    sa.PrimaryKeyConstraint('vendor_id')
                    )
    op.create_index(op.f('ix_vendors_vendor_address'), 'vendors', ['vendor_address'], unique=False)
    op.create_index(op.f('ix_vendors_vendor_id'), 'vendors', ['vendor_id'], unique=False)
    op.create_index(op.f('ix_vendors_vendor_name'), 'vendors', ['vendor_name'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_vendors_vendor_name'), table_name='vendors')
    op.drop_index(op.f('ix_vendors_vendor_id'), table_name='vendors')
    op.drop_index(op.f('ix_vendors_vendor_address'), table_name='vendors')
    op.drop_table('vendors')
    # ### end Alembic commands ###
