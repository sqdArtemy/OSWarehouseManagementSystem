from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Numeric, CheckConstraint, ForeignKey, Boolean, Enum
from db_config import Base, SessionMaker


class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    product_name = Column(String(100), index=True, nullable=False)
    description = Column(String(255), index=True, nullable=False)
    weight = Column(Numeric(precision=20, scale=4, asdecimal=False), nullable=False)
    volume = Column(Numeric(precision=20, scale=4, asdecimal=False), nullable=False)
    price = Column(Numeric(precision=20, scale=2, asdecimal=False), nullable=False)
    expiry_duration = Column(Integer, nullable=True)
    is_stackable = Column(Boolean, nullable=False, default=True)
    product_type = Column(Enum("freezer", "refrigerated", "dry", "hazardous", name="product_type"), nullable=False)

    # Relationships with other tables
    inventory = relationship("Inventory", back_populates="product")
    company = relationship("Company", back_populates="products")
    ordered_item = relationship("OrderItem", back_populates="product")
    product_transaction_items = relationship("TransactionItem", back_populates="product")

    # Constraints
    __table_args__ = (
        CheckConstraint("weight > 0", name="check_weight"),
        CheckConstraint("volume > 0", name="check_volume"),
        CheckConstraint("price > 0", name="check_price")
    )

    def to_dict(self):
        product = SessionMaker().query(Product).filter(Product.product_id == self.product_id).first()
        return {
            "product_id": self.product_id,
            "company": product.company.to_dict() if product.company is not None else {},
            "product_name": self.product_name,
            "description": self.description,
            "weight": self.weight,
            "volume": self.volume,
            "price": self.price,
            "expiry_duration": self.expiry_duration,
            "is_stackable": self.is_stackable,
            "product_type": self.product_type
        }
