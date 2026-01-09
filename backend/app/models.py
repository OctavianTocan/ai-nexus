from datetime import date, datetime
from enum import Enum
from sqlalchemy import Enum as SQLEnum

from sqlalchemy import Date, DateTime, String, Text, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class SenderType(Enum):
    AI = "ai"
    USER = "user"


class Base(DeclarativeBase):
    """
    The base class for all ORM models.
    Inherit from this class to create new database models.
    """

    pass


# Define `Conversation` SQLAlchemy (table) model with fields:
#    - `id` (UUID, primary key)
#    - `user_id` (UUID, foreign key to User)
#    - `title` (string, max 255 chars)
#    - `created_at` (datetime)
#    - `updated_at` (datetime)
class Conversation(Base):
    __tablename__ = "conversations"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int]
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
    id: Mapped[int] = mapped_column(primary_key=True)
    conversation_id: Mapped[int]
    content: Mapped[str] = mapped_column(Text())
    sender: Mapped[SenderType] = mapped_column(SQLEnum(SenderType))
    created_at: Mapped[datetime] = mapped_column(DateTime)
    conversation: Mapped["Conversation"] = relationship(
        "Conversation", back_populates="messages"
    )
