from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, ForeignKey, CheckConstraint, UniqueConstraint
from db_config import Base, get_session


class LostItem(Base):
    __tablename__ = "lost_items"

    lost_item_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    quantity = Column(Integer, nullable=False)

    # Relationships with other tables
    order = relationship("Order", back_populates="lost_items")
    product = relationship("Product", back_populates="lost_item")

    # Constraints
    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_quantity"),
        UniqueConstraint("order_id", "product_id")
    )

    def to_dict(self, cascade_fields: list[str] = ("order", "product")):
        with get_session() as session:
            lost_item = session.query(LostItem).filter(LostItem.order_id == self.order_id).first()
            return {
                "lost_item_id": self.lost_item_id,
                "order": lost_item.order.to_dict(cascade_fields=[]) if "order" in cascade_fields else self.order_id,
                "product": lost_item.product.to_dict(cascade_fields=[]) if "product" in cascade_fields else self.product_id,
                "quantity": self.quantity
            }