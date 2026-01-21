from collections.abc import AsyncGenerator

from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

# 1. Where is the database file?
DATABASE_URL = "sqlite+aiosqlite:///./agno.db"


# 2. Base class for all models
class Base(DeclarativeBase):
    pass


# 3. The User table - inherits standard auth fields automatically:
#    - id (UUID)
#    - email (string, unique)
#    - hashed_password (string)
#    - is_active (bool)
#    - is_superuser (bool)
#    - is_verified (bool)
class User(SQLAlchemyBaseUserTableUUID, Base):
    pass


# 4. Create the database engine (connection pool)
engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


# 5. Function to create tables on startup
async def create_db_and_tables():
    from . import models

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# 6. Dependency: Get a database session
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


# 7. Dependency: Get a user database (for auth operations)
async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
