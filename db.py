from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from schemas.base import GlobalBase

# Ensure all models are imported
from schemas.poll_scheme import Poll
from schemas.user_scheme import User
from schemas.vote_history import VoteHistory
from schemas.proposed_poll_scheme import ProposedPoll
from schemas.token_request_scheme import TokenRequest

DATABASE_URL = "postgresql://aishakarzhauova:795430a@localhost:5432/blockchain_voting"
engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

print("Creating tables...")
GlobalBase.metadata.create_all(engine)
print("Tables created successfully!")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()