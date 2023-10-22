from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from db_config import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"))
    user_name = Column(String(100), index=True)
    user_phone = Column(String(15), unique=True, index=True)
    user_email = Column(String(255), unique=True, index=True)
    user_password = Column(String(255))
    user_role = Column(Enum("owner", "manager", "shipper", "customer", name="user_role"), nullable=False)

    # Relationships with other tables
    company = relationship("Company", back_populates="users")
