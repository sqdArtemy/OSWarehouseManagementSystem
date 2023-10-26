from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Numeric, CheckConstraint
from db_config import Base


class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_name = Column(String(100), index=True, nullable=False)
    description = Column(String(255), index=True)
    weight = Column(Numeric(precision=20, scale=4))
    volume = Column(Numeric(precision=20, scale=4))
    price = Column(Numeric(precision=20, scale=2))
    expiry_duration = Column(Integer)

    # Relationships with other tables
    inventory = relationship("Inventory", back_populates="product")
    ordered_item = relationship("OrderItem", back_populates="product")
    product_transaction_items = relationship("TransactionItem", back_populates="product")

    # Constraints
    __table_args__ = (
        CheckConstraint("weight > 0", name="check_weight"),
        CheckConstraint("volume > 0", name="check_volume"),
        CheckConstraint("price > 0", name="check_price")
    )
