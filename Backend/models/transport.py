from sqlalchemy import Column, Integer, Numeric, CheckConstraint, Enum
from sqlalchemy.orm import relationship

from db_config import Base


class Transport(Base):
    __tablename__ = "transports"

    transport_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transport_capacity = Column(Numeric(precision=20, scale=2, asdecimal=False), nullable=False)
    transport_type = Column(Enum("truck", "van", "car", "helicopter", "ship", "plane", name="transport_type"), nullable=False)
    transport_speed = Column(Numeric(precision=20, scale=2, asdecimal=False), nullable=False)
    price_per_weight = Column(Numeric(precision=20, scale=2, asdecimal=False), nullable=False)

    # Constraints
    __table_args__ = (
        CheckConstraint("transport_capacity > 0", name="check_transport_capacity"),
        CheckConstraint("transport_speed > 0", name="check_transport_speed"),
        CheckConstraint("price_per_weight >= 0", name="check_price_per_weight")
    )

    # Relationships with other tables
    orders = relationship("Order", back_populates="transport")
    transactions = relationship("Transaction", back_populates="transport")

    def to_dict(self, cascade_fields: list[str] = None):
        return {
            "transport_id": self.transport_id,
            "transport_capacity": self.transport_capacity,
            "transport_type": self.transport_type,
            "transport_speed": self.transport_speed,
            "price_per_weight": self.price_per_weight
        }
