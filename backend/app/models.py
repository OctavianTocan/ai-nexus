"""
SQLAlchemy ORM models for the application database.

Note: The ``User`` model lives in ``db.py`` because fastapi-users needs it
at import time. All other domain models are defined here.
"""

import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class SenderType(Enum):
    """Identifies who sent a message in a conversation."""

    AI = "ai"
    USER = "user"


class Conversation(Base):
    """
    Conversation metadata stored in the application database.

    Actual message content is persisted by the Agno library in its own
    SQLite database. The two are linked via ``Conversation.id`` ==
    Agno's ``session_id``.
    """

    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("user.id"))
    title: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime)

    # TODO: Add relationship back to User for bi-directional access
    # user: Mapped["User"] = relationship("User", back_populates="conversations")
