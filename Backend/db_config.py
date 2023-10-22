from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from env_loader import db_url

# Creating engine and session
engine = create_engine(db_url)
SessionLocal = sessionmaker(auto_commit=False, autoflush=False, bind=engine)

Base = declarative_base()
