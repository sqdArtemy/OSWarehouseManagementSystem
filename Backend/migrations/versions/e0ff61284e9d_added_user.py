"""Added User.

Revision ID: e0ff61284e9d
Revises: d24c144ced7f
Create Date: 2023-11-17 14:33:36.956865

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e0ff61284e9d'
down_revision: Union[str, None] = 'd24c144ced7f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
                    sa.Column('user_id', sa.Integer(), autoincrement=True, nullable=False),
                    sa.Column('company_id', sa.Integer(), nullable=False),
                    sa.Column('user_name', sa.String(length=100), nullable=False),
                    sa.Column('user_surname', sa.String(length=100), nullable=False),
                    sa.Column('user_phone', sa.String(length=15), nullable=False),
                    sa.Column('user_email', sa.String(length=255), nullable=False),
                    sa.Column('user_address', sa.String(length=255), nullable=True),
                    sa.Column('user_password', sa.String(length=255), nullable=False),
                    sa.Column('is_password_forgotten', sa.Boolean(), server_default=sa.sql.expression.false(), nullable=True),
                    sa.Column('user_role', sa.Enum('manager', 'supervisor', 'vendor', 'admin', name='user_role'),
                              nullable=False),
                    sa.ForeignKeyConstraint(['company_id'], ['companies.company_id'], ),
                    sa.PrimaryKeyConstraint('user_id')
                    )
    op.create_index(op.f('ix_users_user_email'), 'users', ['user_email'], unique=True)
    op.create_index(op.f('ix_users_user_id'), 'users', ['user_id'], unique=False)
    op.create_index(op.f('ix_users_user_name'), 'users', ['user_name'], unique=False)
    op.create_index(op.f('ix_users_user_phone'), 'users', ['user_phone'], unique=True)
    op.create_index(op.f('ix_users_user_surname'), 'users', ['user_surname'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_users_user_surname'), table_name='users')
    op.drop_index(op.f('ix_users_user_phone'), table_name='users')
    op.drop_index(op.f('ix_users_user_name'), table_name='users')
    op.drop_index(op.f('ix_users_user_id'), table_name='users')
    op.drop_index(op.f('ix_users_user_email'), table_name='users')
    op.drop_table('users')
    # ### end Alembic commands ###
