import os
from dotenv import load_dotenv

# Loading .env file
load_dotenv()

# Loading environment variables
db_url = os.getenv("DATABASE_URL")

# Update alembic.ini file with the database url
with open("alembic.ini", 'r') as file:
    content = file.read()

content = content.replace("sqlalchemy.url = driver://user:pass@localhost/dbname", f"sqlalchemy.url = {db_url}")

with open("alembic.ini", 'w') as file:
    file.write(content)
