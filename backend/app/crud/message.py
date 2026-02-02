# CRUD operations for Message model
# TODO: Implement these functions to manage messages in your database

from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy import select
from app.models import Message


# TODO: Implement function to create a new message
# async def create_message(
#     session: AsyncSession,
#     conversation_id: uuid.UUID,
#     sender: SenderType,
#     content: str
# ) -> Message:
#     """
#     Create a new message in the database.
#
#     Note: This is mainly for backup/analytics purposes.
#     Agno handles actual message storage in its own database.
#     """
#     new_message = Message(
#         conversation_id=conversation_id,
#         sender=sender,
#         content=content
#     )
#     session.add(new_message)
#     await session.commit()
#     await session.refresh(new_message)
#     return new_message


# TODO: Implement function to get all messages for a conversation
# async def get_messages_by_conversation(
#     session: AsyncSession,
#     conversation_id: uuid.UUID
# ) -> list[Message]:
#     """
#     Retrieve all messages for a specific conversation.
#
#     Note: This queries your database (backup/mirror).
#     For actual conversation history, use Agno's API:
#         agent = Agent(db=agno_db)
#         session = agent.get_session(session_id=conversation_id)
#         messages = session.get_chat_history()
#
#     Implementation:
#     result = await session.execute(
#         select(Message).where(Message.conversation_id == conversation_id)
#     )
#     return list(result.scalars().all())
#     """
#     pass


# TODO: Implement function to get messages from Agno database
# from agno.agent import Agent
# from agno.db.sqlite import SqliteDb
#
# async def get_agno_messages(
#     agno_db: SqliteDb,
#     session_id: str
# ) -> list[dict]:
#     """
#     Retrieve messages from Agno's session storage.
#
#     This returns the actual conversation history used by the agent.
#
#     Returns:
#         List of messages with role and content
#     """
#     agent = Agent(db=agno_db)
#     session = agent.get_session(session_id)
#     messages = session.get_chat_history()
#     return [{"role": msg.role, "content": msg.content} for msg in messages]
#     pass


# TODO: Implement function to delete messages for a conversation
# async def delete_messages_by_conversation(
#     session: AsyncSession,
#     conversation_id: uuid.UUID
# ) -> bool:
#     """
#     Delete all messages for a conversation (cascade delete).
#
#     Note: This only affects your database, not Agno's database.
#     For full cleanup, also clear Agno session.
#     """
#     result = await session.execute(
#         select(Message).where(Message.conversation_id == conversation_id)
#     )
#     for message in result.scalars().all():
#         await session.delete(message)
#     await session.commit()
#     return True
#     pass
