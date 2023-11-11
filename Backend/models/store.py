from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, ForeignKey
from db_config import Base, SessionMaker


class Store(Base):
    __tablename__ = "stores"

    store_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=True)
    store_owner_id = Column(Integer, ForeignKey("users.user_id"))
    store_name = Column(String(50), index=True)
    store_address = Column(String(255), index=True)

    # Relationships with other tables
    company = relationship("Company", back_populates="stores")
    store_owner = relationship("User", back_populates="stores")
    received_orders = relationship("Order", back_populates="recipient_store")

    def to_dict(self):
        store = SessionMaker().query(Store).filter(Store.store_id == self.store_id).first()
        return {
            "store_id": self.store_id,
            "company": store.company.to_dict(),
            "store_owner": store.store_owner.to_dict(),
            "store_name": self.store_name,
            "store_address": self.store_address
        }
