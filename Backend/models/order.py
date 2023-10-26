from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, Enum, ForeignKey, Numeric, CheckConstraint, DateTime, func
from db_config import Base


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    supplier_id = Column(Integer, ForeignKey("warehouses.warehouse_id"))
    recipient_store_id = Column(Integer, ForeignKey("stores.store_id"))
    total_price = Column(Numeric(precision=20, scale=2), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, onupdate=func.now(), nullable=True)
    order_status = Column(
        Enum("new", "processing", "submitted", "finished", "cancelled", name="order_status"),
        nullable=False
    )

    # Relationships with other tables
    supplier = relationship("Warehouse", back_populates="supplied_orders")
    recipient_store = relationship("Store", back_populates="received_orders")
    ordered_items = relationship("OrderItem", back_populates="order")

    # Constraints
    __table_args__ = (
        CheckConstraint("total_price > 0", name="check_total_price"),
    )

