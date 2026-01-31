import uuid
from datetime import datetime
from typing import Optional

from fastapi_users import schemas
from pydantic import BaseModel

# These schemas DO NOT create tables. These are Pydantic schemas for the API layer. (Which presumably means that it makes it easier for us to understand/validate the input/outputs).


# What the API returns when you ask for a user
class UserRead(schemas.BaseUser[uuid.UUID]):
    pass  # Inherits: id, email, is_active, is_superuser, is_verified


# What you send when registering a new user
class UserCreate(schemas.BaseUserCreate):
    pass  # Inherits: email, password


# What you send when updating a user
class UserUpdate(schemas.BaseUserUpdate):
    pass  # Inherits: password, email, is_active, is_superuser, is_verified


# -- Conversations --
# We use BaseModel to ensure Pydantic enforces Data Validation. (The idea is that everything in pydantic seems to derieve from BaseModel).
class ConversationCreate(BaseModel):
    """
    Request model for creating a conversation.
    """

    # TODO: Decide if you want to include title field here
    # If YES (user provides title): Add `title: str` field
    # If NO (LLM generates title): Keep as pass (empty)
    # Current plan: LLM generates from first message, so no title needed here
    pass


class ConversationResponse(BaseModel):
    """
    Response model for a conversation.
    """

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    created_at: datetime
    updated_at: datetime

    # TODO: Add these fields if you want to return full conversation metadata:
    # - agno_session_id: Optional[str] (for linking to Agno database)
    # - message_count: Optional[int] (total messages in conversation)
    # - last_message_at: Optional[datetime] (timestamp of last activity)
    # - is_archived: bool (if implementing archiving feature)
    # - tags: Optional[str] (if implementing tags)
    pass


class ChatRequest(BaseModel):
    """
    Request model for chat endpoint.
    """

    # TODO: Add conversation_id field to link messages to conversations
    # This is required for persisting conversation history in Agno
    question: str
    # conversation_id: Optional[uuid.UUID]  # ← Add this field
    #
    # Implementation notes:
    # - If conversation_id provided: Continue existing conversation
    # - If conversation_id is None: Start new conversation (Agno auto-generates session_id)
    # - Use this conversation_id as Agno's session_id: session_id=str(conversation_id)
    pass
