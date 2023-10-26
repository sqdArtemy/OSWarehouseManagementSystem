from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, ForeignKey, UniqueConstraint, Date
from db_config import Base


class Inventory(Base):
    __tablename__ = "inventories"

    inventory_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rack_id = Column(Integer, ForeignKey("racks.rack_id"))
    product_id = Column(Integer, ForeignKey("products.product_id"))
    quantity = Column(Integer)
    arrival_date = Column(Date)
    expiry_date = Column(Date)

    # Relationships with other tables
    rack = relationship("Rack", back_populates="inventory")
    product = relationship("Product", back_populates="inventory")

    # Constraints
    __table_args__ = (
        UniqueConstraint("rack_id", "product_id"),
    )
