from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, String, ForeignKey, Numeric, CheckConstraint, Enum
from .transaction import Transaction
from db_config import Base, get_session


class Warehouse(Base):
    __tablename__ = "warehouses"

    warehouse_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    supervisor_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    warehouse_name = Column(String(50), index=True, nullable=False)
    warehouse_address = Column(String(255), index=True, nullable=False)
    overall_capacity = Column(Numeric(precision=20, scale=2, asdecimal=False), nullable=False)
    remaining_capacity = Column(Numeric(precision=20, scale=2, asdecimal=False), nullable=False)
    warehouse_type = Column(Enum("freezer", "refrigerated", "dry", "hazardous", name="warehouse_type"), nullable=False)

    # Relationships with other tables
    company = relationship("Company", back_populates="warehouses")
    supervisor = relationship("User", back_populates="warehouses")
    racks = relationship("Rack", back_populates="warehouse")
    supplier_transactions = relationship("Transaction", foreign_keys=[Transaction.supplier_id], back_populates="supplier")
    receiver_transactions = relationship("Transaction", foreign_keys=[Transaction.recipient_id], back_populates="recipient_warehouse")
    supplied_orders = relationship(
        "Order",
        back_populates="supplier_warehouse",
        primaryjoin="and_(Warehouse.warehouse_id == Order.supplier_id, Order.order_type == 'from_warehouse')",
        foreign_keys="Order.supplier_id",
        overlaps="supplied_orders,supplier_vendor"
    )
    received_orders = relationship(
        "Order",
        back_populates="recipient_warehouse",
        primaryjoin="and_(Warehouse.warehouse_id == Order.recipient_id, Order.order_type == 'to_warehouse')",
        foreign_keys="Order.recipient_id",
        overlaps="received_orders,recipient_vendor"
    )

    # Constraints
    __table_args__ = (
        CheckConstraint("remaining_capacity <= overall_capacity", name="check_remaining_capacity"),
        CheckConstraint("overall_capacity > 0", name="check_overall_capacity")
    )

    def to_dict(self, cascade_fields: list[str] = ("company", "supervisor")):
        with get_session() as session:
            warehouse = session.query(Warehouse).filter(Warehouse.warehouse_id == self.warehouse_id).first()
            return {
                "warehouse_id": self.warehouse_id,
                "company": warehouse.company.to_dict(cascade_fields=[]) if "company" in cascade_fields else self.company_id,
                "supervisor": warehouse.supervisor.to_dict(cascade_fields=[]) if "supervisor" in cascade_fields else self.supervisor_id,
                "warehouse_name": self.warehouse_name,
                "warehouse_address": self.warehouse_address,
                "overall_capacity": self.overall_capacity,
                "remaining_capacity": self.remaining_capacity,
                "warehouse_type": self.warehouse_type
            }
