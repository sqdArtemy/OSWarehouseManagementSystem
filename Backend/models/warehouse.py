from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, String, ForeignKey, Numeric, CheckConstraint
from db_config import Base


class Warehouse(Base):
    __tablename__ = "warehouses"

    warehouse_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"))
    manager_id = Column(Integer, ForeignKey("users.user_id"))
    warehouse_name = Column(String(50), index=True)
    warehouse_address = Column(String(255), index=True)
    overall_capacity = Column(Numeric(precision=20, scale=2), nullable=False)
    remaining_capacity = Column(Numeric(precision=20, scale=2), nullable=False)

    # Relationships with other tables
    company = relationship("Company", back_populates="warehouses")
    manager = relationship("User", back_populates="warehouses")

    # Constraints
    __table_args__ = (
        CheckConstraint("remaining_capacity <= overall_capacity", name="check_remaining_capacity"),
        CheckConstraint("overall_capacity > 0", name="check_overall_capacity")
    )

