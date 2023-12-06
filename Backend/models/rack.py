from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, CheckConstraint, event
from db_config import Base, get_session


class Rack(Base):
    __tablename__ = "racks"

    rack_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.warehouse_id"), nullable=False)
    rack_position = Column(String(10), index=True, nullable=False)
    overall_capacity = Column(Numeric(precision=20, scale=2, asdecimal=False), nullable=False)
    remaining_capacity = Column(Numeric(precision=20, scale=2, asdecimal=False), nullable=False)

    # Relationships with other tables
    inventories = relationship("Inventory", back_populates="rack")
    warehouse = relationship("Warehouse", back_populates="racks")

    # Constraints
    __table_args__ = (
        CheckConstraint("remaining_capacity <= overall_capacity", name="check_remaining_capacity"),
        CheckConstraint("overall_capacity > 0", name="check_overall_capacity")
    )

    def to_dict(self, cascade_fields: list[str] = ("warehouse",)):
        with get_session() as session:
            rack = session.query(Rack).filter(Rack.rack_id == self.rack_id).first()
            return {
                "rack_id": self.rack_id,
                "warehouse": rack.warehouse.to_dict(cascade_fields=[]) if "warehouse" in cascade_fields else self.warehouse_id,
                "rack_position": self.rack_position,
                "overall_capacity": self.overall_capacity,
                "remaining_capacity": self.remaining_capacity,
                "inventories": [inventory.to_dict(cascade_fields=[]) for inventory in rack.inventories] if rack else []
            }


# Event listeners (like triggers in SQL)
@event.listens_for(Rack.remaining_capacity, "set", retval=True)
def update_warehouse_remaining_capacity(target, value, oldvalue, initiator):
    if target.warehouse:
        target.warehouse.remaining_capacity = target.warehouse.remaining_capacity - (value - oldvalue)
    return value
