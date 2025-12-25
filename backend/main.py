from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json

from agno.agent import Agent
from agno.db.sqlite import SqliteDb
from agno.models.google import Gemini
from agno.os import AgentOS
from agno.tools.mcp import MCPTools

from dotenv import load_dotenv

from pydantic import BaseModel


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

# Create the FastAPI app.
app = FastAPI()
# Middleware. (We need this to allow the frontend to make requests to the backend).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the Agent
agno_agent = Agent(
    name="Agno Agent",
    model=Gemini(id="gemini-2.0-flash"),
    # Add a database to the Agent
    db=SqliteDb(db_file="agno.db"),
    # Add the Agno MCP server to the Agent
    tools=[MCPTools(transport="streamable-http", url="https://docs.agno.com/mcp")],
    # Add the previous session history to the context
    add_history_to_context=True,
    markdown=True,
)


@app.post("/api/chat")
def chat(request: ChatRequest) -> StreamingResponse:
    """
    This endpoint is used to chat with the Agno agent.
    Args:
        request: The request to the chat API.
    Returns:
        A StreamingResponse object.
        The StreamingResponse object contains the response from the Agno agent.
        The response is returned as a stream of events.
        The events are returned as a JSON object with a "type" key and a "content" key.
        The "type" key is either "delta" or "done".
    """

    def event_stream():
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
