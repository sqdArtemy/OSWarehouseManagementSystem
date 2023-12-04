"""Added Product.

Revision ID: 25a2c11d705b
Revises: 05ee3aa09c03
Create Date: 2023-11-17 14:37:22.803176

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '25a2c11d705b'
down_revision: Union[str, None] = '05ee3aa09c03'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('products',
                    sa.Column('product_id', sa.Integer(), autoincrement=True, nullable=False),
                    sa.Column('company_id', sa.Integer(), nullable=False),
                    sa.Column('product_name', sa.String(length=100), nullable=False),
                    sa.Column('description', sa.String(length=255), nullable=False),
                    sa.Column('weight', sa.Numeric(precision=20, scale=4, asdecimal=False), nullable=False),
                    sa.Column('volume', sa.Numeric(precision=20, scale=4, asdecimal=False), nullable=False),
                    sa.Column('price', sa.Numeric(precision=20, scale=2, asdecimal=False), nullable=False),
                    sa.Column('expiry_duration', sa.Integer(), nullable=True),
                    sa.Column('is_stackable', sa.Boolean(), nullable=False),
                    sa.Column('product_type',
                              sa.Enum('freezer', 'refrigerated', 'dry', 'hazardous', name='product_type'),
                              nullable=False),
                    sa.CheckConstraint('price >= 0', name='check_price'),
                    sa.CheckConstraint('volume > 0', name='check_volume'),
                    sa.CheckConstraint('weight > 0', name='check_weight'),
                    sa.ForeignKeyConstraint(['company_id'], ['companies.company_id'], ),
                    sa.PrimaryKeyConstraint('product_id')
                    )
    op.create_index(op.f('ix_products_description'), 'products', ['description'], unique=False)
    op.create_index(op.f('ix_products_product_id'), 'products', ['product_id'], unique=False)
    op.create_index(op.f('ix_products_product_name'), 'products', ['product_name'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_products_product_name'), table_name='products')
    op.drop_index(op.f('ix_products_product_id'), table_name='products')
    op.drop_index(op.f('ix_products_description'), table_name='products')
    op.drop_table('products')
    # ### end Alembic commands ###
