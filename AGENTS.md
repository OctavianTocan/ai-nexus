# AGENTS.md - AI Nexus Codebase Guidelines

## Project Overview

AI Nexus is a "second brain" chatbot with streaming LLM responses. It uses a monorepo structure with a Python backend (FastAPI + Agno agent framework) and TypeScript frontend (Next.js 16).

## Commands

### Development

```bash
bun dev                    # Start both frontend (3001) and backend (8000)
bun frontend:dev           # Next.js only (port 3001)
bun dev:backend            # FastAPI only (port 8000)
```

### Frontend (Next.js 16 + React 19)

```bash
cd frontend && bun run dev         # Start dev server
cd frontend && bun run build       # Production build
cd frontend && bun run lint        # Run ESLint
cd frontend && bun run start       # Start production server
```

### Backend (FastAPI + Python 3.13)

```bash
cd backend && uv run pytest                    # Run all tests
cd backend && uv run pytest tests/test_x.py   # Run single test file
cd backend && uv run pytest -v                # Verbose test output
cd backend && uv run pytest -k "test_name"    # Run tests matching name
cd backend && uv run fastapi dev main.py      # Development with hot reload
```

## Architecture

```
ai-nexus/
├── backend/                    # FastAPI + Python 3.13
│   ├── main.py                 # API entry point, /api/chat SSE endpoint
│   └── app/
│       ├── db.py               # SQLAlchemy async setup, User model
│       ├── models.py           # Conversation, Message models
│       ├── schemas.py          # Pydantic request/response schemas
│       ├── users.py            # FastAPI-Users JWT auth setup
│       └── crud/               # Database operations
│           ├── conversation.py
│           └── message.py
├── frontend/                   # Next.js 16 + React 19
│   ├── app/                    # App Router (pages, layouts)
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── login/page.tsx      # Login page
│   │   ├── signup/page.tsx     # Signup page
│   │   └── c/[conversationId]/ # Dynamic chat route
│   ├── components/
│   │   ├── chat/               # Chat UI components
│   │   ├── ai-elements/        # AI-specific UI (message, loader, etc.)
│   │   └── ui/                 # Shadcn/Radix components
│   ├── hooks/
│   │   ├── use-chat.ts         # SSE streaming hook
│   │   └── use-authed-fetch.ts # Auth-aware fetcher
│   └── lib/
│       ├── api.ts              # API endpoint definitions
│       └── utils.ts            # cn() utility for className merging
└── dev.ts                      # Bun script that starts both services
```

## Technology Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Runtime  | Bun (root), uv (Python)             |
| Frontend | Next.js 16, React 19, Tailwind 4    |
| Backend  | FastAPI, Python 3.13                |
| AI       | Agno agent framework, Google Gemini |
| Auth     | FastAPI-Users (JWT cookies)         |
| DB       | SQLite + aiosqlite + SQLAlchemy     |
| UI       | Radix UI, Shadcn, Motion            |

## Key Technical Decisions

### Authentication

- **Backend**: FastAPI-Users with JWT in httpOnly cookies (`session_token`)
- **Frontend**: `useAuthedFetch()` hook handles credentials and 401 redirects
- **Secret**: `AUTH_SECRET` env var required
- **Cookie**: httpOnly, secure (prod), sameSite: lax, maxAge: 3600s

### Streaming Chat

- Backend uses Agno agent framework with Gemini model
- SSE format: `data: {"type": "delta", "content": "..."}\n\n`
- Stream end: `data: [DONE]\n\n`
- Frontend parses with `TextDecoderStream` in `useChat()` hook

### Database

- SQLite via aiosqlite (file: `agno.db`)
- Dual database architecture in same file:
  - Your tables: User, Conversation, Message (SQLAlchemy)
  - Agno tables: agent_sessions, agent_memories (managed by Agno)
- `conversation_id` is used as `session_id` in Agno to link them
- Always use async sessions: `async with async_session_maker() as session:`

## Environment Variables

### Backend (`backend/.env`)

```bash
AUTH_SECRET=<jwt-signing-secret>     # Required: JWT signing key
GOOGLE_API_KEY=<gemini-api-key>      # Required: Google AI API key
ENV=dev|prod                         # Optional: Controls secure cookie flag
```

### Frontend (`frontend/.env`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Code Style Guidelines

### Python (Backend)

- **Imports**: External libraries → internal modules (app.\*)
- **Type annotations**: Required for all function parameters and returns
- **Pydantic models**: API layer (schemas.py), SQLAlchemy for DB layer (models.py)
- **Async/await**: Always use async for database operations
- **Error handling**: Return proper HTTP status codes, raise meaningful exceptions
- **Dependencies**: Use `uv` for Python package management
- **FastAPI patterns**: Use Depends() for dependencies, Router for organization

```python
# Model structure example
class UserCreate(BaseModel):  # Pydantic schema (API layer)
    email: str
    password: str

class User(Base):  # SQLAlchemy model (DB layer)
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True)
```

### TypeScript (Frontend)

- **Strict mode**: Enabled with `noUncheckedIndexedAccess`
- **Path aliases**: Use `@/*` for imports from root (e.g., `@/components/ui/button`)
- **"use client"**: Required for client-side components with hooks
- **Components**: Export multiple components from files, use memo for performance
- **Type imports**: Use `import type` for type-only imports
- **Class merging**: Always use `cn()` utility for className composition
- **Variants**: Use `class-variance-authority` (cva) for component variants

```typescript
// Component pattern
export function Button({ className, ...props }: Props) {
  return <button className={cn(baseStyles, className)} {...props} />
}
```

### Import Ordering

- TypeScript: External → Radix/UI → Internal (@/) → Relative
- Python: Standard library → FastAPI/third-party → app.\*

### Naming Conventions

- **Components**: PascalCase (Message, PromptInput)
- **Hooks**: camelCase with "use" prefix (useChat, useAuthedFetch)
- **Utils**: camelCase (cn, streamMessage)
- **Python functions**: snake_case (create_db_and_tables, get_async_session)
- **Python classes**: PascalCase (User, Conversation)

## API Endpoints

| Endpoint                  | Method | Status | Description         |
| ------------------------- | ------ | ------ | ------------------- |
| `/auth/jwt/login`         | POST   | ✅     | User login          |
| `/auth/register`          | POST   | ✅     | User registration   |
| `/auth/jwt/logout`        | POST   | ❌     | User logout (TODO)  |
| `/api/v1/conversations`   | POST   | ✅     | Create conversation |
| `/api/v1/conversations`   | GET    | ❌     | List conversations  |
| `/api/v1/conversations/*` | CRUD   | ❌     | Full CRUD (TODO)    |
| `/api/chat`               | POST   | ✅     | Stream chat (SSE)   |

## Frontend API Calls

```typescript
// Always use useAuthedFetch for protected endpoints
const fetcher = useAuthedFetch();
const response = await fetcher("/api/chat", { method: "POST", ... });
```

## UI Components

- Use Radix UI primitives and shadcn components from `@/components/ui/*`
- Follow existing component patterns with variant props
- AI elements in `@/components/ai-elements/*`

## Testing

- Backend: pytest with async support
- Frontend: No tests configured yet (add Jest/Vitest as needed)

## Known Security Considerations

| Issue                   | Risk   | Notes                                |
| ----------------------- | ------ | ------------------------------------ |
| Chat endpoint ownership | HIGH   | Verify user owns conversation (TODO) |
| Rate limiting           | MEDIUM | Add slowapi middleware (TODO)        |
| CORS production config  | MEDIUM | Environment-based origins (TODO)     |

## Notion MCP

When using the Notion MCP, the root page for all ai-nexus project documentation is:
2fd3c065-308b-8087-a18f-f37830dc4572

For pages created there (thoughts, documentation, or other info), use a clean folder structure: group related pages under a few top-level pages when it makes sense, and avoid a flat list of many sibling pages at the root.

When asked about the project's TODOs, whether as research or because they need updates, refer to https://www.notion.so/infimagames/491c672e3fa14ce09a0690850dd06565?v=c9c38cb8bca041df846c726f3bc8d687

## Resources

- [API Reference](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Agno Framework](https://docs.agno.dev/)
