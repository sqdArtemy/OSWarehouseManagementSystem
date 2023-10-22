from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, CheckConstraint
from db_config import Base


class Rack(Base):
    __tablename__ = "racks"

    rack_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.warehouse_id"))
    rack_position = Column(String(10), index=True)
    overall_capacity = Column(Numeric(precision=20, scale=2), nullable=False)
    remaining_capacity = Column(Numeric(precision=20, scale=2), nullable=False)

    # Relationships with other tables
    warehouse = relationship("Warehouse", back_populates="racks")

    # Constraints
    __table_args__ = (
        CheckConstraint("remaining_capacity <= overall_capacity", name="check_remaining_capacity"),
        CheckConstraint("overall_capacity > 0", name="check_overall_capacity")
    )
