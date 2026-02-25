"""
FastAPI application entry point.

Defines all API routes, configures middleware, and wires up authentication.
"""

import json
import uuid
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import List, Optional

from agno.agent import Agent, Message
from agno.db.sqlite import SqliteDb
from agno.models.google import Gemini
from agno.tools.mcp import MCPTools
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio.session import AsyncSession

from app.crud.conversation import (
    create_conversation_service,
    get_conversation_service,
    get_conversations_for_user_service,
    update_conversation_title_service,
)
from app.db import User, create_db_and_tables, get_async_session
from app.models import Conversation
from app.schemas import (
    ChatRequest,
    ConversationCreate,
    ConversationResponse,
    UserCreate,
    UserRead,
    UserUpdate,
)
from app.users import auth_backend, current_active_user, fastapi_users

load_dotenv()


# --- Lifespan ----------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Run startup tasks (database table creation) before the app begins serving."""
    await create_db_and_tables()
    yield


# --- App & Middleware --------------------------------------------------------

app = FastAPI(lifespan=lifespan)

# TODO: Make CORS origins configurable via environment variable.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auth routes (provided by fastapi-users) ---------------------------------

app.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

# --- Agno agent database -----------------------------------------------------

agno_db = SqliteDb(db_file="agno.db")


# --- Conversation endpoints --------------------------------------------------

@app.get("/api/v1/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> Optional[List[Message]]:
    """Return the message history for a conversation.

    Verifies ownership first, then reads from the Agno database using the
    conversation ID as the Agno session ID. Returns an empty list for new
    conversations that have no messages yet.
    """
    conversation = await get_conversation_service(user.id, session, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    try:
        agent = Agent(db=agno_db)
        return agent.get_chat_history(session_id=str(conversation_id))
    except (ValueError, KeyError, AttributeError):
        return []


@app.get("/api/v1/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> Optional[ConversationResponse]:
    """Return metadata for a single conversation."""
    conversation: Optional[Conversation] = await get_conversation_service(
        user.id, session, conversation_id
    )
    if conversation:
        return ConversationResponse(
            title=conversation.title,
            id=conversation.id,
            user_id=conversation.user_id,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
        )
    return None


@app.post("/api/v1/conversations/{conversation_id}/title")
async def generate_conversation_title(
    conversation_id: uuid.UUID,
    first_message: str = None,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> str:
    """Generate an LLM-based title for a conversation and persist it.

    Uses the first user message as context for the Gemini model to produce
    a short, descriptive title.
    """
    agent = Agent(
        model=Gemini(id="gemini-3-flash-preview"),
    )
    response = agent.run(
        "Generate a title for the conversation based on the first message: "
        + first_message
        + ". Return only the title, no other text or explanation.",
    )

    await update_conversation_title_service(
        title=response.content,
        user_id=user.id,
        conversation_id=conversation_id,
        session=session,
    )
    return response.content


@app.get("/api/v1/conversations")
async def list_conversations(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> List[ConversationResponse]:
    """List all conversations for the authenticated user, most-recent first."""
    conversations: List[Conversation] = await get_conversations_for_user_service(
        user.id, session
    )
    return [
        ConversationResponse(
            title=conversation.title,
            id=conversation.id,
            user_id=conversation.user_id,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
        )
        for conversation in conversations
    ]


@app.post("/api/v1/conversations/{conversation_id}")
async def create_conversation(
    conversation_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> ConversationResponse:
    """Create a new conversation with a default title.

    The ``conversation_id`` is provided as a path parameter because the
    frontend pre-generates UUIDs before the first message is sent.
    The title will be updated asynchronously via LLM title generation.
    """
    new_conversation: Conversation = await create_conversation_service(
        user.id, session, ConversationCreate(id=conversation_id)
    )
    return ConversationResponse(
        title=new_conversation.title,
        id=new_conversation.id,
        user_id=new_conversation.user_id,
        created_at=new_conversation.created_at,
        updated_at=new_conversation.updated_at,
    )


# --- Chat endpoint -----------------------------------------------------------

@app.post("/api/chat")
async def chat(
    request: ChatRequest,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> StreamingResponse:
    """Stream an Agno agent response as Server-Sent Events.

    Architecture:
        - Application DB stores conversation metadata (title, user_id, timestamps).
        - Agno DB stores actual message content and history.
        - They are linked by ``Conversation.id`` == Agno ``session_id``.

    Flow:
        1. Frontend creates conversation via ``POST /api/v1/conversations``.
        2. Frontend sends chat with ``conversation_id``.
        3. Backend uses ``conversation_id`` as Agno's ``session_id``.
        4. Agno persists messages under that session.

    SSE payload format:
        - ``{"type": "delta", "content": "..."}`` for each streamed chunk.
        - ``[DONE]`` sentinel when the response is complete.
    """
    conversation_id = request.conversation_id

    # Ownership check — ensure the conversation belongs to this user.
    user_conversation: Optional[Conversation] = await get_conversation_service(
        user.id, session, conversation_id
    )
    if user_conversation is None:
        return None

    agno_agent = Agent(
        name="Agno Agent",
        user_id=str(user.id),
        session_id=str(conversation_id),
        model=Gemini(id="gemini-3-flash-preview"),
        db=agno_db,
        tools=[MCPTools(transport="streamable-http", url="https://docs.agno.com/mcp")],
        add_history_to_context=True,
        num_history_runs=3,
        markdown=True,
    )

    def event_stream():
        """Yield SSE-formatted chunks from the Agno agent."""
        for ev in agno_agent.run(request.question, stream=True):
            chunk = getattr(ev, "content", None)
            if chunk:
                payload = {"type": "delta", "content": chunk}
                yield f"data: {json.dumps(payload)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
