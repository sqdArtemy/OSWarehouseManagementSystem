from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, Enum, ForeignKey, CheckConstraint, DateTime, Boolean, Numeric, func
from db_config import Base, get_session


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    supplier_id = Column(Integer, ForeignKey("warehouses.warehouse_id"), nullable=True)
    recipient_id = Column(Integer, ForeignKey("warehouses.warehouse_id"), nullable=True)
    transport_id = Column(ForeignKey("transports.transport_id"), nullable=True)
    status = Column(
        Enum("new", "processing", "submitted", "finished", "cancelled", "delivered", name="transaction_status"),
        nullable=False
    )
    total_price = Column(Numeric(precision=20, scale=2, asdecimal=False), default=0, nullable=False)
    is_internal = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now(), nullable=True)

    # Relationships with other tables
    transport = relationship("Transport", back_populates="transactions")
    supplier = relationship("Warehouse", foreign_keys=[supplier_id], back_populates="supplier_transactions")
    recipient_warehouse = relationship("Warehouse",  foreign_keys=[recipient_id], back_populates="receiver_transactions")
    transaction_items = relationship("TransactionItem", back_populates="transaction")

    # Constraints
    __table_args__ = (
        CheckConstraint("recipient_id <> supplier_id", name="check_recipient_supplier"),
    )

    def to_dict(self, cascade_filters: list[str] = ("supplier", "recipient_warehouse")):
        with get_session() as session:
            transaction = session.query(Transaction).filter(Transaction.transaction_id == self.transaction_id).first()
            return {
                "transaction_id": self.transaction_id,
                "supplier": transaction.supplier.to_dict(cascade_filters=[]) if "supplier" in cascade_filters else self.supplier_id,
                "recipient_warehouse": transaction.recipient_warehouse.to_dict(cascade_filters=[]) if "recipient_warehouse" in cascade_filters else self.recipient_id,
                "status": self.status
            }
