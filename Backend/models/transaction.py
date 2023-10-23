from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, Enum, ForeignKey, CheckConstraint, DateTime, func
from db_config import Base


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    supplier_id = Column(Integer, ForeignKey("warehouses.warehouse_id"))
    recipient_id = Column(Integer, ForeignKey("warehouses.warehouse_id"))
    status = Column(
        Enum("new", "processing", "submitted", "finished", "cancelled", name="transaction_status"),
        nullable=False
    )
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships with other tables
    supplier = relationship("Warehouse", back_populates="supplier_transactions")
    recipient_store = relationship("Warehouse", back_populates="receiver_transactions")

    # Constraints
    __table_args__ = (
        CheckConstraint("recipient_id <> supplier_id", name="check_recipient_supplier"),
    )
