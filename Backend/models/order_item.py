from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, ForeignKey, CheckConstraint, UniqueConstraint
from db_config import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    order_item_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"))
    product_id = Column(Integer, ForeignKey("products.product_id"))
    quantity = Column(Integer)

    # Relationships with other tables
    order = relationship("Order", back_populates="ordered_items")
    product = relationship("Product", back_populates="ordered_item")

    # Constraints
    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_quantity"),
        UniqueConstraint("order_id", "product_id")
    )
