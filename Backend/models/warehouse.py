from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, String, ForeignKey, Numeric, CheckConstraint
from .transaction import Transaction
from db_config import Base, SessionMaker


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
    supplied_orders = relationship("Order", back_populates="supplier")
    racks = relationship("Rack", back_populates="warehouse")
    supplier_transactions = relationship("Transaction", foreign_keys=[Transaction.supplier_id], back_populates="supplier")
    receiver_transactions = relationship("Transaction", foreign_keys=[Transaction.recipient_id], back_populates="recipient_warehouse")

    # Constraints
    __table_args__ = (
        CheckConstraint("remaining_capacity <= overall_capacity", name="check_remaining_capacity"),
        CheckConstraint("overall_capacity > 0", name="check_overall_capacity")
    )

    def to_dict(self):
        warehouse = SessionMaker().query(Warehouse).filter(Warehouse.warehouse_id == self.warehouse_id).first()
        return {
            "warehouse_id": self.warehouse_id,
            "company": warehouse.manager.to_dict(),
            "manager": warehouse.manager.to_dict(),
            "warehouse_name": self.warehouse_name,
            "warehouse_address": self.warehouse_address,
            "overall_capacity": self.overall_capacity,
            "remaining_capacity": self.remaining_capacity
        }
