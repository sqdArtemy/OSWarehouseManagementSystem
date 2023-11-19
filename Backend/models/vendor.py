from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from db_config import Base, SessionMaker


class Vendor(Base):
    __tablename__ = "vendors"

    vendor_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vendor_name = Column(String(255), index=True, nullable=False)
    vendor_address = Column(String(255), index=True, nullable=True)
    vendor_owner_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    is_government = Column(Boolean, nullable=False, default=False)

    # Relationships with other tables
    vendor_owner = relationship("User", back_populates="vendors")
    supplied_orders = relationship(
        "Order",
        back_populates="supplier_vendor",
        primaryjoin="and_(Vendor.vendor_id == Order.supplier_id, Order.order_type == 'to_warehouse')",
        foreign_keys="Order.supplier_id",
        overlaps="supplier_warehouse"
    )
    received_orders = relationship(
        "Order",
        back_populates="recipient_vendor",
        primaryjoin="and_(Vendor.vendor_id == Order.recipient_id, Order.order_type == 'from_warehouse')",
        foreign_keys="Order.recipient_id",
        overlaps="recipient_warehouse"
    )

    def to_dict(self):
        vendor = SessionMaker().query(Vendor).filter(Vendor.vendor_id == self.vendor_id).first()
        return {
            "vendor_id": self.vendor_id,
            "vendor_owner": vendor.vendor_owner.to_dict(),
            "vendor_name": self.vendor_name,
            "vendor_address": self.vendor_address,
            "is_government": self.is_government
        }
