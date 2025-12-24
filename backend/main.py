from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agno.agent import Agent
from agno.db.sqlite import SqliteDb
from agno.models.google import Gemini
from agno.os import AgentOS
from agno.tools.mcp import MCPTools

# Create the FastAPI app.
app = FastAPI()
# Middleware. (We need this to allow the frontend to make requests to the backend).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
def read_root(question: str):
    agno_agent.print_response(question)
    return