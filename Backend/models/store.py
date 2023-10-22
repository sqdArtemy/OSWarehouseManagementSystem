from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, ForeignKey
from db_config import Base


class Store(Base):
    __tablename__ = "stores"

    store_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"))
    store_owner_id = Column(Integer, ForeignKey("users.user_id"))
    store_name = Column(String(50), index=True)
    store_address = Column(String(255), index=True)

    # Relationships with other tables
    company = relationship("Company", back_populates="stores")
    store_owner = relationship("User", back_populates="stores")
