from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String
from db_config import Base


class Company(Base):
    __tablename__ = "companies"

    company_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_name = Column(String(50), index=True)
    company_email = Column(String(255), unique=True, index=True)

    # Relationships with other tables
    stores = relationship("Store", back_populates="company")
    users = relationship("User", back_populates="company")
    warehouses = relationship("Warehouse", back_populates="company")
