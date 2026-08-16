from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite pra começar - simples, sem precisar instalar servidor de banco.
# Se um dia crescer, dá pra trocar só essa linha pra Postgres.
SQLALCHEMY_DATABASE_URL = "sqlite:///./estoque.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency do FastAPI: abre uma sessão por request e fecha no final."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
