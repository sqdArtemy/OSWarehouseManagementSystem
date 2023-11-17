from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, Enum, ForeignKey, CheckConstraint, DateTime, Boolean, Numeric, func
from db_config import Base, SessionMaker


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    supplier_id = Column(Integer, ForeignKey("warehouses.warehouse_id"), nullable=True)
    recipient_id = Column(Integer, ForeignKey("warehouses.warehouse_id"), nullable=True)
    shipper_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    status = Column(
        Enum("new", "processing", "submitted", "finished", "cancelled", "delivered", name="transaction_status"),
        nullable=False
    )
    total_price = Column(Numeric(precision=20, scale=2, asdecimal=False), default=0, nullable=False)
    is_internal = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now(), nullable=True)

    # Relationships with other tables
    supplier = relationship("Warehouse", foreign_keys=[supplier_id], back_populates="supplier_transactions")
    shipper = relationship("User", back_populates="transactions")
    recipient_warehouse = relationship("Warehouse",  foreign_keys=[recipient_id], back_populates="receiver_transactions")
    transaction_items = relationship("TransactionItem", back_populates="transaction")

    # Constraints
    __table_args__ = (
        CheckConstraint("recipient_id <> supplier_id", name="check_recipient_supplier"),
    )

    def to_dict(self):
        transaction = SessionMaker().query(Transaction).filter(Transaction.transaction_id == self.transaction_id).first()
        return {
            "transaction_id": self.transaction_id,
            "shipper": transaction.shipper.to_dict(),
            "supplier": transaction.supplier.to_dict(),
            "recipient_warehouse": transaction.recipient_warehouse.to_dict(),
            "status": self.status
        }
