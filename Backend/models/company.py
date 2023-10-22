from sqlalchemy import Column, Integer, String
from db_config import Base


class Company(Base):
    __tablename__ = "companies"

    company_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_name = Column(String(50), index=True)
    company_email = Column(String(255), unique=True, index=True)
