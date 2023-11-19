"""Added company

Revision ID: d24c144ced7f
Revises: 
Create Date: 2023-11-17 14:31:19.165325

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd24c144ced7f'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('companies',
                    sa.Column('company_id', sa.Integer(), autoincrement=True, nullable=False),
                    sa.Column('company_name', sa.String(length=50), nullable=False),
                    sa.Column('company_email', sa.String(length=255), nullable=False),
                    sa.PrimaryKeyConstraint('company_id')
                    )
    op.create_index(op.f('ix_companies_company_email'), 'companies', ['company_email'], unique=True)
    op.create_index(op.f('ix_companies_company_id'), 'companies', ['company_id'], unique=False)
    op.create_index(op.f('ix_companies_company_name'), 'companies', ['company_name'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_companies_company_name'), table_name='companies')
    op.drop_index(op.f('ix_companies_company_id'), table_name='companies')
    op.drop_index(op.f('ix_companies_company_email'), table_name='companies')
    op.drop_table('companies')
    # ### end Alembic commands ###
