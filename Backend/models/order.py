from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, Enum, ForeignKey, Numeric, CheckConstraint, DateTime, func
from db_config import Base, SessionMaker


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    supplier_id = Column(Integer, ForeignKey("warehouses.warehouse_id"))
    shipper_id = Column(Integer, ForeignKey("users.user_id"))
    recipient_vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    total_price = Column(Numeric(precision=20, scale=2), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, onupdate=func.now(), nullable=True)
    order_status = Column(
        Enum("new", "processing", "submitted", "finished", "cancelled", "delivered", "lost", "damaged",
             name="order_status"),
        nullable=False
    )

    # Relationships with other tables
    supplier = relationship("Warehouse", back_populates="supplied_orders")
    shipper = relationship("User", back_populates="orders")
    recipient_vendor = relationship("Vendor", back_populates="received_orders")
    ordered_items = relationship("OrderItem", back_populates="order")

    # Constraints
    __table_args__ = (
        CheckConstraint("total_price > 0", name="check_total_price"),
    )

    def to_dict(self):
        order = SessionMaker().query(Order).filter(Order.order_id == self.order_id).first()
        return {
            "order_id": self.order_id,
            "supplier": order.supplier.to_dict(),
            "shipper": order.shipper.to_dict(),
            "recipient_vendor": order.recipient_vendor.to_dict(),
            "total_price": self.total_price,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "order_status": self.order_status
        }
