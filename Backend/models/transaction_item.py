from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, ForeignKey, CheckConstraint, UniqueConstraint
from db_config import Base, get_session


class TransactionItem(Base):
    __tablename__ = "transaction_items"

    transaction_item_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(Integer, ForeignKey("transactions.transaction_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    quantity = Column(Integer, nullable=False)

    # Relationships with other tables
    transaction = relationship("Transaction", back_populates="transaction_items")
    product = relationship("Product", back_populates="product_transaction_items")

    # Constraints
    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_quantity"),
        UniqueConstraint("product_id", "transaction_id")
    )

    def to_dict(self, cascade_filters: list[str] = ("transaction", "product")):
        with get_session() as session:
            transaction_item = session.query(TransactionItem).filter(TransactionItem.transaction_item_id == self.transaction_item_id).first()
            return {
                "transaction_item_id": self.transaction_item_id,
                "transaction": transaction_item.transaction.to_dict(cascade_filters=[]) if "transaction" in cascade_filters else self.transaction_id,
                "product": transaction_item.product.to_dict(cascade_filters=[]) if "product" in cascade_filters else self.product_id,
                "quantity": self.quantity
            }
