import uuid

from agno.agent.agent import Agent
from agno.db.sqlite.sqlite import SqliteDb
from agno.models.google.gemini import Gemini
from agno.tools.mcp.mcp import MCPTools

# Initialize the Agno database.
agno_db = SqliteDb(db_file="agno.db")


def create_agent(user_id: uuid.UUID, conversation_id: uuid.UUID) -> Agent:
    """
    This function allows us to create an Agno agent.
    """

    agno_agent = Agent(
        name="Agno Agent",
        user_id=str(user_id),
        session_id=str(conversation_id),
        model=Gemini(id="gemini-3-flash-preview"),
        db=agno_db,
        tools=[MCPTools(transport="streamable-http", url="https://docs.agno.com/mcp")],
        add_history_to_context=True,
        num_history_runs=3,
        markdown=True,
    )

    return agno_agent


if __name__ == "__main__":
    # Standalone test
    agent = create_agent("test-user", "test-session")
    agent.print_response("Hello!", stream=True)
