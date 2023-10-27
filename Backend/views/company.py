from models import Company
from db_config import get_session, SessionMaker


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


def is_company_already_exists(company_email: str) -> bool:
    """
    Check if company with given email already exists in the database.
    :param company_email: email of the company
    :return: True if company already exists, False otherwise
    """
    company = SessionMaker().query(Company).filter_by(company_email=company_email).first()

    return company is not None
