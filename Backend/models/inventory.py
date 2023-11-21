from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, ForeignKey, UniqueConstraint, Date, Numeric, event
from db_config import Base, SessionMaker


class Inventory(Base):
    __tablename__ = "inventories"

    inventory_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rack_id = Column(Integer, ForeignKey("racks.rack_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_volume = Column(Numeric(precision=20, scale=2, asdecimal=False), default=0, nullable=False)
    arrival_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=True)

    # Relationships with other tables
    rack = relationship("Rack", back_populates="inventories")
    product = relationship("Product", back_populates="inventory")

    # Constraints
    __table_args__ = (
        UniqueConstraint("rack_id", "product_id"),
    )

    def to_dict(self):
        inventory = SessionMaker().query(Inventory).filter(Inventory.inventory_id == self.inventory_id).first()
        return {
            "inventory_id": self.inventory_id,
            "rack": inventory.rack.to_dict(),
            "product": inventory.product.to_dict(),
            "quantity": self.quantity,
            "total_volume": self.total_volume,
            "arrival_date": self.arrival_date,
            "expiry_date": self.expiry_date
        }


# Event listeners (like triggers in SQL)
@event.listens_for(Inventory.total_volume, "set", retval=True)
def update_remaining_rack_capacity(target, value, oldvalue, initiator):
    if target.rack:
        target.rack.remaining_capacity = target.rack.remaining_capacity - (value - oldvalue)
    return value
