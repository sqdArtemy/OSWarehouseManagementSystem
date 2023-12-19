from sqlalchemy.orm import relationship
from sqlalchemy import Integer, Column, ForeignKey, CheckConstraint, UniqueConstraint, DateTime, func
from db_config import Base, get_session


class ThrownItem(Base):
    __tablename__ = "thrown_items"

    thrown_item_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.warehouse_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    thrown_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships with other tables
    warehouse = relationship("Warehouse", back_populates="thrown_items")
    product = relationship("Product", back_populates="thrown_item")

    # Constraints
    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_quantity"),
        UniqueConstraint("warehouse_id", "product_id", "thrown_at")
    )

    def to_dict(self, cascade_fields: list[str] = ("warehouse", "product")):
        with get_session() as session:
            thrown_item = session.query(ThrownItem).filter(ThrownItem.warehouse_id == self.warehouse_id, ThrownItem.product_id == self.product_id, ThrownItem.thrown_at == self.thrown_at).first()
            return {
                "lost_item_id": self.lost_item_id,
                "warehouse": thrown_item.warehouse.to_dict(cascade_fields=[]) if "warehouse" in cascade_fields else self.warehouse_id,
                "product": thrown_item.product.to_dict(cascade_fields=[]) if "product" in cascade_fields else self.product_id,
                "quantity": self.quantity,
                "thrown_at": self.thrown_at
            }