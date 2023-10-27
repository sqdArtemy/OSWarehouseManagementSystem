from models import Company
from db_config import get_session


def create_company(data: dict) -> int:
    """
    Create a new company in the database.
    :param data: dictionary containing company_name and company_email
    :return: company_id of the newly created company
    """
    with get_session() as session:
        new_company = Company(
            company_name=data["company_name"],
            company_email=data["company_email"]
        )
        session.add(new_company)
        session.commit()

        return new_company.company_id
