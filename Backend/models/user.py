from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from db_config import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_ud = Column(Integer, ForeignKey("companies.company_id"))
    user_name = Column(String(100), index=True)
    user_phone = Column(String(15), unique=True, index=True)
    user_email = Column(String(255), unique=True, index=True)
    user_password = Column(String(255))

    # Relationships with other tables
    company = relationship("Company", back_populates="users")
