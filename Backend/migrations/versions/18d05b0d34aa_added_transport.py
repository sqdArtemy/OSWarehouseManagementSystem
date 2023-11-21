"""Added Transport.

Revision ID: 18d05b0d34aa
Revises: d97949d7a798
Create Date: 2023-11-17 15:37:55.654317

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '18d05b0d34aa'
down_revision: Union[str, None] = 'd97949d7a798'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('transports',
    sa.Column('transport_id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('transport_capacity', sa.Numeric(precision=20, scale=2, asdecimal=False), nullable=False),
    sa.Column('transport_type', sa.Enum('truck', 'van', 'car', 'helicopter', name='transport_type'), nullable=False),
    sa.Column('transport_speed', sa.Numeric(precision=20, scale=2, asdecimal=False), nullable=False),
    sa.Column('price_per_weight', sa.Numeric(precision=20, scale=2, asdecimal=False), nullable=False),
    sa.CheckConstraint('price_per_weight > 0', name='check_price_per_weight'),
    sa.CheckConstraint('transport_capacity > 0', name='check_transport_capacity'),
    sa.CheckConstraint('transport_speed > 0', name='check_transport_speed'),
    sa.PrimaryKeyConstraint('transport_id')
    )
    op.create_index(op.f('ix_transports_transport_id'), 'transports', ['transport_id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_transports_transport_id'), table_name='transports')
    op.drop_table('transports')
    # ### end Alembic commands ###
