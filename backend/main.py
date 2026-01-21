import json
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from agno.agent import Agent
from agno.db.sqlite import SqliteDb
from agno.models.google import Gemini
from agno.os import AgentOS
from agno.tools.mcp import MCPTools
from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.db import User, create_db_and_tables
from app.schemas import UserCreate, UserRead, UserUpdate
from app.users import auth_backend, current_active_user, fastapi_users


# API Response Models.
class ChatResponse(BaseModel):
    """
    This model is used to represent the response from the Agno agent.
    Args:
        response: The response from the Agno agent.
    Returns:
        A JSON object with a "response" key.
        The "response" key contains the response from the Agno agent.
    """

    # The response from the Agno agent.
    response: str


# API Request Models.
class ChatRequest(BaseModel):
    """
    This model is used to represent the request to the chat API.
    Args:
        question: The question to ask the Agno agent.
    Returns:
        A JSON object with a "question" key.
    """

    # The question to ask the Agno agent.
    question: str


# Load the environment variables.
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    This function is called when the FastAPI app starts and stops.
    It creates the database tables and yields the app.
    Args:
        app: The FastAPI app.
    Returns:
        None.
    """
    await create_db_and_tables()
    yield


# Create the FastAPI app.
app = FastAPI(lifespan=lifespan)
# Middleware. (We need this to allow the frontend to make requests to the backend).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This includes the authentication routes.
app.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
)
# This includes the registration routes.
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
# This includes the user routes.
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

# Create the Agno database.
agno_db = SqliteDb(db_file="agno.db")


@app.post("/api/chat")
def chat(
    request: ChatRequest, user: User = Depends(current_active_user)
) -> StreamingResponse:
    """
    This endpoint is used to chat with the Agno agent.
    Args:
        request: The request to the chat API.
        user: The current active user.
    Returns:
        A StreamingResponse object.
        The StreamingResponse object contains the response from the Agno agent.
        The response is returned as a stream of events.
        The events are returned as a JSON object with a "type" key and a "content" key.
        The "type" key is either "delta" or "done".
    """
    # Create the Agno agent.
    # TODO: We need a session_id here so we can persist the conversation history. This session_id should come from the database, and we should be able to use our Conversation model to create/use it.
    agno_agent = Agent(
        name="Agno Agent",
        user_id=str(user.id),
        # When updating this, apparently the server needs to be restarted (?)
        model=Gemini(id="gemini-3-flash-preview"),
        # Add a database to the Agent
        db=agno_db,
        # Add the Agno MCP server to the Agent
        tools=[MCPTools(transport="streamable-http", url="https://docs.agno.com/mcp")],
        # Add the previous session history to the context
        add_history_to_context=True,
        num_history_runs=3,
        markdown=True,
    )

    def event_stream():
        """
        Stream!
        """
        # Iterate Agno's streaming events
        for ev in agno_agent.run(request.question, stream=True):
            chunk = getattr(ev, "content", None)
            if chunk:
                # Send a "delta" payload to the client
                payload = {"type": "delta", "content": chunk}
                yield f"data: {json.dumps(payload)}\n\n"

        # Signal completion
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
