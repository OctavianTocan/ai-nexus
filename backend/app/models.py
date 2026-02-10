import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

# TODO: Add ForeignKey import when implementing relationships
# from sqlalchemy import ForeignKey
from sqlalchemy import DateTime, ForeignKey, String, Text, Uuid
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base

# TODO: Import User type for type hints (avoid circular import)
if TYPE_CHECKING:
    from .db import User


# Define `SenderType` enum with values:
#    1. AI
#    2. USER
class SenderType(Enum):
    """
    Enum for message sender types.
    1. AI
    2. USER
    """

    AI = "ai"
    USER = "user"


# Define `Conversation` SQLAlchemy (table) model with fields:
#    - `id` (UUID, primary key)
#    - `user_id` (UUID, foreign key to User)
#    - `title` (string, max 255 chars)
#    - `created_at` (datetime)
#    - `updated_at` (datetime)
class Conversation(Base):
    __tablename__ = "conversations"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("user.id"))
    # Title is capped at 255 characters.
    title: Mapped[str] = mapped_column(String(255))
    # Dates.
    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime)

    # TODO: Add ForeignKey constraint to link to User table
    # user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("user.id"))

    # TODO: Add relationship back to User for bi-directional access
    # user: Mapped["User"] = relationship("User", back_populates="conversations")

    # TODO: Add relationship to User in db.py User model
    # conversations: Mapped[list["Conversation"]] = relationship("Conversation", back_populates="user")
