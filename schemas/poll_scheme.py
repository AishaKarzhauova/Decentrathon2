from sqlalchemy import Column, Integer, String, Boolean, ARRAY, Text
from sqlalchemy.orm import relationship

# from db import GlobalBase
from schemas.base import GlobalBase


class Poll(GlobalBase):
    __tablename__ = "polls"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    candidates = Column(ARRAY(Text), nullable=False)
    active = Column(Boolean, default=True, nullable=False)

    vote_history = relationship("VoteHistory", back_populates="poll")
