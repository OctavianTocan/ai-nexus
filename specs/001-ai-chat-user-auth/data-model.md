# Data Model: AI Chat with User Authentication

**Feature**: 001-ai-chat-user-auth
**Date**: 2025-12-24

## Overview

This document defines the database schema for the AI chat application with user authentication. The system uses SQLite with SQLAlchemy async ORM, storing users, chat conversations, messages, and sessions.

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│    users     │         │  conversations   │         │  messages   │
├─────────────┤         ├──────────────────┤         ├─────────────┤
│ id (PK)     │◄───────│ id (PK)          │◄───────│ id (PK)     │
│ email (U)   │         │ user_id (FK)     │         │ conv_id (FK)│
│ password    │         │ title            │         │ content     │
│ created_at  │         │ created_at       │         │ sender      │
└─────────────┘         │ updated_at       │         │ created_at  │
                        └──────────────────┘         └─────────────┘

┌─────────────┐
│  sessions   │
├─────────────┤
│ id (PK)     │
│ user_id (FK)│◄────────┐
│ token (U)   │         │
│ expires_at  │         │
└─────────────┘         │
                        │
                        │
┌────────────────────────┘
│
│
┌─────────────┐
│    users    │
└─────────────┘
```

## Tables

### users

Stores registered user accounts with authentication credentials.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address (login identifier) |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt-hashed password |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_users_email` on `email` (for login lookups)

**Validation Rules**:
- Email format: Must be valid RFC-compliant email
- Password: Minimum 8 characters, must contain uppercase, lowercase, and number (enforced at application level)
- Email uniqueness enforced at database level

### conversations

Stores AI chat sessions, each belonging to a specific user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique conversation identifier |
| user_id | INTEGER | FOREIGN KEY → users.id, NOT NULL | Owner of this conversation |
| title | VARCHAR(255) | NOT NULL, DEFAULT "New Chat" | Display title for conversation |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Conversation creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last activity timestamp |

**Indexes**:
- `idx_conversations_user_id` on `user_id` (for user's chat list queries)
- `idx_conversations_updated_at` on `updated_at` (for sorting by recent activity)

**Validation Rules**:
- `user_id` must reference valid user
- Title length: Maximum 255 characters
- Title default: "New Chat" if not provided during creation

### messages

Stores individual messages within conversations (from user or AI).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique message identifier |
| conversation_id | INTEGER | FOREIGN KEY → conversations.id, NOT NULL | Parent conversation |
| content | TEXT | NOT NULL | Message content (plain text) |
| sender | VARCHAR(10) | NOT NULL, CHECK (sender IN ('user', 'ai')) | Message sender type |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Message timestamp |

**Indexes**:
- `idx_messages_conversation_id` on `conversation_id` (for fetching message history)
- `idx_messages_created_at` on `created_at` (for chronological ordering)

**Validation Rules**:
- `conversation_id` must reference valid conversation
- `sender` must be exactly 'user' or 'ai'
- Content length: No hard limit at DB level (app level: max 10,000 characters)

### sessions

Stores active user sessions for authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT | Unique session identifier |
| user_id | INTEGER | FOREIGN KEY → users.id, NOT NULL | Associated user |
| token | VARCHAR(255) | UNIQUE, NOT NULL | JWT session token |
| expires_at | TIMESTAMP | NOT NULL | Session expiration time |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Session creation timestamp |

**Indexes**:
- `idx_sessions_token` on `token` (for auth lookups)
- `idx_sessions_user_id` on `user_id` (for user session cleanup)
- `idx_sessions_expires_at` on `expires_at` (for expired session cleanup)

**Validation Rules**:
- `user_id` must reference valid user
- `token` uniqueness enforced at database level
- `expires_at` must be in the future (app level validation)

## Relationships

### One-to-Many: User → Conversations

- One user can have multiple conversations
- Each conversation belongs to exactly one user
- Foreign key: `conversations.user_id` references `users.id`
- Cascade: When user is deleted, cascade delete all their conversations

### One-to-Many: Conversation → Messages

- One conversation can have multiple messages
- Each message belongs to exactly one conversation
- Foreign key: `messages.conversation_id` references `conversations.id`
- Cascade: When conversation is deleted, cascade delete all its messages

### One-to-Many: User → Sessions

- One user can have multiple active sessions
- Each session belongs to exactly one user
- Foreign key: `sessions.user_id` references `users.id`
- Cascade: When user is deleted, cascade delete all their sessions

## State Transitions

### Conversation Lifecycle

1. **Created**: When user clicks "New Chat"
   - `created_at` = current timestamp
   - `updated_at` = current timestamp
   - `title` = "New Chat" (default)

2. **Message Added**: When user or AI sends a message
   - `updated_at` = current timestamp
   - `title` may update to first message content (if still "New Chat")

3. **Deleted**: When user deletes conversation (not in initial scope)
   - All associated messages cascade deleted

### Message Lifecycle

1. **Created**: When message is sent (user or AI)
   - `created_at` = current timestamp
   - `sender` = 'user' or 'ai'

2. **Never modified**: Messages are immutable once created
   - If editing needed, create new message (not in initial scope)

### Session Lifecycle

1. **Created**: When user logs in
   - `token` = generated JWT
   - `expires_at` = current time + 24 hours

2. **Refreshed**: When user remains active (not in initial scope)
   - Extend `expires_at` to current time + 24 hours

3. **Expired**: When `expires_at` < current time
   - Session considered invalid
   - Background cleanup job removes expired sessions

## SQLAlchemy Models

### User Model

```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
```

### Conversation Model

```python
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="New Chat")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
```

### Message Model

```python
from sqlalchemy import CheckConstraint

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, index=True)
    content = Column(String(10000), nullable=False)  # App-level limit
    sender = Column(String(10), nullable=False)  # 'user' or 'ai'
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Check constraint for sender
    __table_args__ = (
        CheckConstraint("sender IN ('user', 'ai')", name="ck_message_sender"),
    )

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
```

### Session Model

```python
class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="sessions")
```

## Migration Strategy

Use Alembic for database migrations:

1. **Initial migration** (v001_initial_schema):
   - Create all 4 tables
   - Create indexes
   - Add foreign key constraints
   - Add check constraints

2. **Future migrations** (as needed):
   - Add user profile fields (name, avatar)
   - Add conversation sharing/collaboration
   - Add message attachments
   - Add conversation folders/tags

## Data Retention Policy

- **Users**: Retained indefinitely unless deleted by user
- **Conversations**: Retained indefinitely unless deleted by user
- **Messages**: Retained indefinitely unless parent conversation deleted
- **Sessions**: Expired sessions deleted after 7 days via background job
