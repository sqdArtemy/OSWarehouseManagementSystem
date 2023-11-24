from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String
from db_config import Base


class Company(Base):
    __tablename__ = "companies"

    company_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_name = Column(String(50), index=True, nullable=False)
    company_email = Column(String(255), unique=True, index=True, nullable=False)

    # Relationships with other tables
    products = relationship("Product", back_populates="company")
    users = relationship("User", back_populates="company")
    warehouses = relationship("Warehouse", back_populates="company")

    def to_dict(self, cascade_fields: list[str] = None):
        return {
            "company_id": self.company_id,
            "company_name": self.company_name,
            "company_email": self.company_email
        }
