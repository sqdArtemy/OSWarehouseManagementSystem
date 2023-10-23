from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, ForeignKey, CheckConstraint, UniqueConstraint
from db_config import Base


class TransactionItem(Base):
    __tablename__ = "transaction_items"

    transaction_item_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(Integer, ForeignKey("transactions.transaction_id"))
    product_id = Column(Integer, ForeignKey("products.product_id"))
    quantity = Column(Integer)

    # Relationships with other tables
    transaction = relationship("Transaction", back_populates="transaction_items")
    product = relationship("Transaction", back_populates="product_transaction_items")

    # Constraints
    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_quantity"),
        UniqueConstraint("product_id", "transaction_id")
    )
