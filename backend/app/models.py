import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

# TODO: Add ForeignKey import when implementing relationships
# from sqlalchemy import ForeignKey
from sqlalchemy import DateTime, String, Text, Uuid
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
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid)
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

    # Messages.
    messages: Mapped[list["Message"]] = relationship(
        "Message", back_populates="conversation"
    )


# Define `Message` SQLAlchemy model with fields:
#    - `id` (UUID, primary key)
#    - `conversation_id` (UUID, foreign key to Conversation)
#    - `content` (text)
#    - `sender` (string, "user" or "ai")
#    - `created_at` (datetime)
class Message(Base):
    __tablename__ = "messages"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(Uuid)
    content: Mapped[str] = mapped_column(Text())
    sender: Mapped[SenderType] = mapped_column(SQLEnum(SenderType))
    created_at: Mapped[datetime] = mapped_column(DateTime)
    conversation: Mapped["Conversation"] = relationship(
        "Conversation", back_populates="messages"
    )

    # TODO: Consider adding user_id field if you want to track which user sent each message
    # This would be useful for multi-user conversations or analytics
    # user_id: Mapped[Optional[uuid.UUID]] = mapped_column(Uuid, ForeignKey("user.id"), nullable=True)


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
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid)
    # Title is capped at 255 characters.
    title: Mapped[str] = mapped_column(String(255))
    # Dates.
    created_at: Mapped[datetime] = mapped_column(DateTime)
    updated_at: Mapped[datetime] = mapped_column(DateTime)
    # Messages.
    messages: Mapped[list["Message"]] = relationship(
        "Message", back_populates="conversation"
    )


# Define `Message` SQLAlchemy model with fields:
#    - `id` (UUID, primary key)
#    - `conversation_id` (UUID, foreign key to Conversation)
#    - `content` (text)
#    - `sender` (string, "user" or "ai")
#    - `created_at` (datetime)
class Message(Base):
    __tablename__ = "messages"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(Uuid)
    content: Mapped[str] = mapped_column(Text())
    sender: Mapped[SenderType] = mapped_column(SQLEnum(SenderType))
    created_at: Mapped[datetime] = mapped_column(DateTime)
    conversation: Mapped["Conversation"] = relationship(
        "Conversation", back_populates="messages"
    )
