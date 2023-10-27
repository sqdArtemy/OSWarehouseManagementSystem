from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from db_config import Base, SessionMaker


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.company_id"))
    user_name = Column(String(100), index=True)
    user_surname = Column(String(100), index=True)
    user_phone = Column(String(15), unique=True, index=True)
    user_email = Column(String(255), unique=True, index=True)
    user_password = Column(String(255))
    user_role = Column(Enum("owner", "manager", "shipper", "customer", name="user_role"), nullable=False)

    # Relationships with other tables
    company = relationship("Company", back_populates="users")
    stores = relationship("Store", back_populates="store_owner")
    warehouses = relationship("Warehouse", back_populates="manager")

    def to_dict(self):
        user = SessionMaker().query(User).filter(User.user_id == self.user_id).first()
        return {
            "user_id": self.user_id,
            "company": user.company.to_dict(),
            "user_name": self.user_name,
            "user_surname": self.user_surname,
            "user_phone": self.user_phone,
            "user_email": self.user_email,
            "user_role": self.user_role
        }
