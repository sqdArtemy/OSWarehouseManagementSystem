from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from db_config import Base, SessionMaker, get_session


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"), nullable=False)
    user_name = Column(String(100), index=True, nullable=False)
    user_surname = Column(String(100), index=True, nullable=False)
    user_phone = Column(String(15), unique=True, index=True, nullable=False)
    user_email = Column(String(255), unique=True, index=True, nullable=False)
    user_address = Column(String(255), nullable=True)
    user_password = Column(String(255), nullable=False)
    user_role = Column(Enum("manager", "supervisor", "vendor", "admin", name="user_role"), nullable=False)

    # Relationships with other tables
    company = relationship("Company", back_populates="users")
    vendors = relationship("Vendor", back_populates="vendor_owner")
    warehouses = relationship("Warehouse", back_populates="supervisor")

    def to_dict(self, cascade_fields: list[str] = ("company",)):
        with get_session() as session:
            user = session.query(User).filter(User.user_id == self.user_id).first()
            return {
                "user_id": self.user_id,
                "company": user.company.to_dict(cascade_fields=[]) if "company" in cascade_fields else self.company_id,
                "user_name": self.user_name,
                "user_surname": self.user_surname,
                "user_phone": self.user_phone,
                "user_email": self.user_email,
                "user_address": self.user_address,
                "user_role": self.user_role
            }
