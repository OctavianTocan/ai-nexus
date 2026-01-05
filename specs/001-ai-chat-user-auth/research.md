# Research: AI Chat with User Authentication

**Feature**: 001-ai-chat-user-auth
**Date**: 2025-12-24

## Overview

This document consolidates research findings for the AI chat authentication feature, focusing on authentication strategies, AI agent integration, and MCP server implementation.

## Authentication Strategy

### Decision: FastAPI + passlib + secure cookie sessions

**Rationale**:
- FastAPI's built-in `OAuth2PasswordBearer` and `OAuth2PasswordRequestForm` provide a solid foundation
- `passlib` with `bcrypt` for secure password hashing (industry standard)
- HTTP-only secure cookies for session management (simpler than JWT for initial implementation)
- No need for external OAuth providers initially - keeps scope focused

**Alternatives considered**:
- JWT tokens: More stateless but requires token refresh logic and more complex client-side handling
- Third-party auth (Auth0, Clerk): Overkill for current scope, introduces external dependencies
- Session-based with Redis: Better for scaling but adds infrastructure complexity

**Implementation approach**:
1. Use `passlib.context.CryptContext` with `bcrypt` for password hashing
2. Create a simple session table in SQLite to store session tokens with expiration
3. Use FastAPI's `Response.set_cookie()` with `httponly=True` and `secure=True` flags
4. Create auth middleware to validate session tokens on protected routes

**Dependencies**:
- `passlib[bcrypt]` for password hashing
- `python-jose[cryptography]` for session token generation (JWT-based session tokens)
- FastAPI's `Security` dependency injection for route protection

## AI Agent Integration (Agno + Google Gemini)

### Decision: Agno framework with Gemini model provider

**Rationale**:
- Agno (v2.3.21+) provides a high-level abstraction for building AI agents
- Google Gemini API offers good performance and cost-effectiveness
- Agno handles conversation context management and tool integration
- Direct API integration would require reinventing conversation state management

**Alternatives considered**:
- Direct Gemini API calls: Less abstraction, more manual context management
- OpenAI API: Higher cost, Agno already has strong Gemini integration
- Anthropic Claude: Good performance but less integrated with Agno ecosystem

**Implementation approach**:
1. Configure Agno with Google Gemini API key (from environment variable)
2. Create an Agno Agent with system prompt for chat assistant
3. Use Agno's conversation history management to track messages
4. Implement message streaming for real-time AI responses
5. Store conversation IDs to link Agno sessions with our database

**Configuration**:
```python
from agno.agent import Agent
from agno.models.openai import OpenAIChatModel

agent = Agent(
    name="chat-assistant",
    model=OpenAIChatModel(
        id="gemini-2.0-flash-exp",  # or latest Gemini model
        api_key="GOOGLE_API_KEY",
        base_url="https://generativelanguage.googleapis.com/v1beta"
    ),
    instructions="You are a helpful AI assistant. Keep responses concise and friendly."
)
```

**Dependencies**:
- `agno>=2.3.21` (already in pyproject.toml)
- `google-genai>=1.56.0` (already in pyproject.toml)

## MCP Server Integration (FastMCP)

### Decision: FastMCP for future extensibility

**Rationale**:
- FastMCP allows the chat application to expose its own tools/services
- Enables the AI agent to call backend functions (e.g., "check my chat history")
- Future-proofs the application for MCP client integrations
- Minimal overhead to set up initially

**Implementation approach**:
1. Define MCP tools for chat operations (create chat, list chats, get messages)
2. Use FastMCP server to expose these tools to Agno agents
3. Initially keep MCP server separate from main API (can run on different port)
4. Document MCP schema for future client integrations

**MCP Tools to expose**:
- `list_conversations(user_id)`: Get all conversations for a user
- `get_conversation_messages(conversation_id)`: Get message history
- `create_conversation(user_id, title)`: Create new chat
- `send_message(conversation_id, user_message)`: Send message and get AI response

**Dependencies**:
- `mcp>=1.25.0` (already in pyproject.toml)
- `fastapi-mcp` (may need to install)

## Database Schema Strategy

### Decision: SQLAlchemy async with SQLite

**Rationale**:
- SQLite is simple for local development and initial deployment
- SQLAlchemy 2.0+ provides async support for better performance
- Easy migration to PostgreSQL if needed later
- Async patterns align with FastAPI's async/await model

**Implementation approach**:
1. Use `create_async_engine` with `aiosqlite` for async SQLite access
2. Define declarative models with type hints
3. Use Alembic for migrations (even with SQLite, good practice)
4. Implement foreign key constraints for data integrity

**Tables needed**:
- `users`: id, email, password_hash, created_at
- `conversations`: id, user_id, title, created_at, updated_at
- `messages`: id, conversation_id, content, sender (user/ai), created_at
- `sessions`: id, user_id, token, expires_at

**Dependencies**:
- `sqlalchemy>=2.0.45` (already in pyproject.toml)
- `aiosqlite` for async SQLite support
- `alembic` for migrations

## Frontend State Management

### Decision: React Context + SWR for data fetching

**Rationale**:
- React Context is sufficient for simple auth state (no complex state needed)
- SWR provides automatic revalidation, caching, and optimistic updates
- Simpler than Redux/Zustand for this use case
- SWR's `useSWR` hook is perfect for chat message lists

**Implementation approach**:
1. Create `AuthContext` for login state and session management
2. Use `useSWRMutation` for mutations (login, register, send message)
3. Use `useSWR` for data fetching (chat list, message history)
4. Implement optimistic updates for message sending

**Dependencies**:
- `swr` for data fetching and caching

## Storybook Setup

### Decision: Storybook 8+ for component documentation

**Rationale**:
- Required by AI Nexus Constitution
- Enables isolated component development
- Visual documentation for ai-elements components
- Useful for demonstrating UI variants

**Implementation approach**:
1. Install Storybook: `bunx storybook@latest init`
2. Configure for Next.js 16 with App Router
3. Create `.stories.tsx` files alongside components
4. Add stories for all auth and chat components
5. Document component props with `argTypes`

**Stories to create**:
- `LoginForm.stories.tsx`: Default, with errors, loading state
- `RegisterForm.stories.tsx`: Default, validation errors, success state
- `ChatList.stories.tsx`: Empty, populated, loading
- `ChatView.stories.tsx`: With messages, empty conversation, AI typing
- `MessageBubble.stories.tsx`: User message, AI message, different lengths

**Dependencies**:
- `@storybook/react@next`
- `@storybook/addon-essentials`
- `@storybook/nextjs`

## Testing Strategy

### Frontend Testing: bun test

**Approach**:
- Unit tests for components using `@testing-library/react`
- Integration tests for API client functions
- Mock fetch calls in tests

**Test coverage targets**:
- All auth components: Login form, register form
- All chat components: Chat list, chat view, message input
- API client functions: login, register, create chat, send message

### Backend Testing: pytest

**Approach**:
- Unit tests for service layer (auth_service, chat_service, ai_service)
- Integration tests for API routes (using `TestClient`)
- Contract tests for API schemas
- Mock external dependencies (AI service, email sending)

**Test coverage targets**:
- All service functions with edge cases
- All API endpoints with happy path and error paths
- Auth middleware and protected route access

## Open Questions Resolved

### Q1: How to handle AI service errors?
**Answer**: Wrap AI calls in try/catch, return user-friendly error messages in chat, log full error for debugging

### Q2: Session expiration handling?
**Answer**: Set session cookie with 24-hour expiry, implement auto-refresh on activity, redirect to login on 401 errors

### Q3: Real-time message streaming?
**Answer**: Initially implement simple send/receive pattern (simpler), consider WebSocket streaming in future iteration

### Q4: How to handle concurrent edits on same chat?
**Answer**: SQLite transactions handle data integrity, last-write-wins for simplicity initially (optimistic locking can be added later)

### Q5: Storybook compatibility with Next.js 16 App Router?
**Answer**: Storybook 8+ supports App Router, may need to configure stories to use `@storybook/nextjs` addon

## Dependencies Summary

### New frontend dependencies to add:
- `swr` - Data fetching and caching
- `@testing-library/react` - Component testing utilities
- `@testing-library/user-event` - User interaction simulation

### New backend dependencies to add:
- `passlib[bcrypt]` - Password hashing
- `python-jose[cryptography]` - JWT session token generation
- `aiosqlite` - Async SQLite driver
- `alembic` - Database migrations
- `httpx` - Async HTTP client for testing

### Storybook dependencies to add:
- `@storybook/react@next`
- `@storybook/addon-essentials`
- `@storybook/nextjs`

## Performance Considerations

- Use database indexes on foreign keys (user_id, conversation_id)
- Implement message pagination for long conversations (limit to 50 messages initially)
- Cache user session in memory to reduce database hits
- Use connection pooling for database (SQLAlchemy engine pool)
- Implement rate limiting on API endpoints (especially message sending)

## Security Considerations

- HTTP-only, secure, same-site cookies for sessions
- CSRF protection on all mutation endpoints
- Input validation using Pydantic models
- SQL injection prevention via SQLAlchemy ORM
- Password hashing with bcrypt (cost factor 12)
- Rate limiting on login endpoint (prevent brute force)
- Sanitize all user messages before storing (prevent XSS in message display)
