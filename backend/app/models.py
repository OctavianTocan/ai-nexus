from datetime import date, datetime

from sqlalchemy import Date, DateTime, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


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


class Message(Base):
    pass
