# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Nexus is a "second brain" chatbot with streaming LLM responses. It uses a monorepo structure with a Python backend (FastAPI + Agno agent framework) and TypeScript frontend (Next.js 16).

## Commands

```bash
# Development (both services)
bun dev                           # Starts frontend (3001) and backend (8000) together

# Individual services
bun frontend:dev                  # Next.js only (port 3001)
bun dev:backend                   # FastAPI only (port 8000)

# Frontend-specific (from /frontend)
bun build                         # Production build
bun lint                          # ESLint

# Backend-specific (from /backend)
uv run pytest                     # Run tests
uv run pytest tests/test_x.py    # Single test file
```

## Architecture

```
ai-nexus/
├── backend/                 # FastAPI + Python 3.13
│   ├── main.py             # API entry point, /api/chat SSE endpoint
│   └── app/
│       ├── db.py           # SQLAlchemy async setup, User model
│       ├── models.py       # Conversation, Message models
│       ├── schemas.py      # Pydantic request/response schemas
│       ├── users.py        # FastAPI-Users JWT auth setup
│       └── crud/           # Database operations
├── frontend/               # Next.js 16 + React 19
│   ├── app/                # App Router (pages, layouts)
│   ├── components/
│   │   ├── chat/          # Chat UI components
│   │   └── ui/            # Shadcn/Radix components
│   └── hooks/
│       ├── use-chat.ts    # SSE streaming hook
│       └── use-authed-fetch.ts  # Auth-aware fetcher
└── dev.ts                  # Bun script that starts both services
```

## Key Technical Decisions

### Authentication

- **Backend**: FastAPI-Users with JWT in httpOnly cookies (`session_token`)
- **Frontend**: `useAuthedFetch()` hook handles credentials and 401 redirects
- **Secret**: `AUTH_SECRET` env var required

### Streaming Chat

- Backend uses Agno agent framework with Gemini model
- SSE format: `data: {"type": "delta", "content": "..."}\n\n`
- Stream end: `data: [DONE]\n\n`
- Frontend parses with `TextDecoderStream` in `useChat()` hook

### Database

- SQLite via aiosqlite (file: `agno.db`)
- Two databases in same file:
  - FastAPI-Users tables (User)
  - Agno agent tables (managed by Agno)
- Custom models: Conversation, Message with relationships

## Environment Variables

```bash
# backend/.env
AUTH_SECRET=<jwt-signing-secret>
ENV=dev|prod                      # Controls secure cookie flag

# frontend/.env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Patterns

### Backend Model Structure

```python
# Pydantic schema (API layer) - app/schemas.py
class ConversationCreate(BaseModel): ...

# SQLAlchemy model (DB layer) - app/models.py
class Conversation(Base): ...
```

### Frontend API Calls

```typescript
// Always use useAuthedFetch for protected endpoints
const fetcher = useAuthedFetch();
const response = await fetcher("/api/chat", { method: "POST", ... });
```

## Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Runtime  | Bun (root), uv (Python)             |
| Frontend | Next.js 16, React 19, Tailwind 4    |
| Backend  | FastAPI, Python 3.13                |
| AI       | Agno agent framework, Google Gemini |
| Auth     | FastAPI-Users (JWT cookies)         |
| DB       | SQLite + aiosqlite + SQLAlchemy     |
| UI       | Radix UI, Shadcn, Motion            |
