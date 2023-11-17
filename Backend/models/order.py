from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, Enum, ForeignKey, Numeric, CheckConstraint, DateTime, func
from db_config import Base, SessionMaker


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    supplier_id = Column(Integer, nullable=False)
    recipient_id = Column(Integer, nullable=False)
    total_price = Column(Numeric(precision=20, scale=2, asdecimal=False), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now(), nullable=True)
    order_status = Column(
        Enum("new", "processing", "submitted", "finished", "cancelled", "delivered", "lost", "damaged",
             name="order_status"),
        nullable=False
    )
    order_type = Column(
        Enum("from_warehouse", "to_warehouse", name="order_type"),
        nullable=False
    )

    # Relationships with other tables
    ordered_items = relationship("OrderItem", back_populates="order")
    supplier_warehouse = relationship(
        "Warehouse",
        back_populates="supplied_orders",
        foreign_keys=supplier_id,
        primaryjoin="Order.supplier_id == Warehouse.warehouse_id"
    )
    recipient_vendor = relationship(
        "Vendor",
        back_populates="received_orders",
        foreign_keys=recipient_id,
        primaryjoin="Order.recipient_id == Vendor.vendor_id"
    )
    supplier_vendor = relationship(
        "Vendor",
        back_populates="supplied_orders",
        foreign_keys="Order.supplier_id",
        primaryjoin="Order.supplier_id == Vendor.vendor_id",
        overlaps="supplier_vendor_relationship"
    )
    recipient_warehouse = relationship(
        "Warehouse",
        back_populates="received_orders",
        foreign_keys="Order.recipient_id",
        primaryjoin="Order.recipient_id == Warehouse.warehouse_id",
        overlaps="recipient_warehouse_relationship"
    )

    # Constraints
    __table_args__ = (
        CheckConstraint("total_price > 0", name="check_total_price"),
    )

    def to_dict(self):
        order = SessionMaker().query(Order).filter(Order.order_id == self.order_id).first()
        supplier = order.supplier_warehouse if order.order_type == "from_warehouse" else order.supplier_vendor
        recipient = order.recipient_warehouse if order.order_type == "to_warehouse" else order.recipient_vendor
        return {
            "order_id": self.order_id,
            "supplier": supplier.to_dict() if supplier else {},
            "recipient": recipient.to_dict() if recipient else {},
            "total_price": self.total_price,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "order_status": self.order_status
        }
