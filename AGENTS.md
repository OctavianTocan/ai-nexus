# AGENTS.md - AI Nexus Codebase Guidelines

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
cd backend && uv run pytest tests/test_x.py     # Run single test file
cd backend && uv run pytest -v                 # Verbose test output
cd backend && uv run pytest -k "test_name"      # Run tests matching name
```

## Code Style Guidelines

### Python (Backend)
- **Imports**: External libraries → internal modules (app.*)
- **Type annotations**: Required for all function parameters and returns
- **Pydantic models**: API layer (schemas.py), SQLAlchemy for DB layer (models.py)
- **Async/await**: Always use async for database operations (aiosqlite + SQLAlchemy async)
- **Error handling**: Return proper HTTP status codes, raise meaningful exceptions
- **Dependencies**: Use `uv` for Python package management
- **FastAPI patterns**: Use Depends() for dependencies, Router for organization

```python
# Model structure example
class UserCreate(BaseModel):  # Pydantic schema
    email: str
    password: str

class User(Base):  # SQLAlchemy model
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
TypeScript: External → Radix/UI → Internal (@/) → Relative
Python: Standard library → FastAPI/third-party → app.*

### Naming Conventions
- **Components**: PascalCase (Message, PromptInput)
- **Hooks**: camelCase with "use" prefix (useChat, useAuthedFetch)
- **Utils**: camelCase (cn, streamMessage)
- **Python functions**: snake_case (create_db_and_tables, get_async_session)
- **Python classes**: PascalCase (User, Conversation)

### Error Handling
- **Frontend**: 401 redirects to /login via useAuthedFetch(), throw Error objects
- **Backend**: Use FastAPI exception handlers, return appropriate HTTP status codes

### Authentication
- **Backend**: FastAPI-Users with JWT cookies (httpOnly session_token)
- **Frontend**: Always use `useAuthedFetch()` for protected endpoints
- **Env**: Requires `AUTH_SECRET` for JWT signing

### Streaming (Chat API)
- Backend yields SSE format: `data: {"type": "delta", "content": "..."}\n\n`
- Stream end: `data: [DONE]\n\n`
- Frontend uses `TextDecoderStream` and AsyncGenerator

### Database
- SQLite with aiosqlite (file: agno.db)
- FastAPI-Users tables (User) + Agno agent tables + custom models (Conversation, Message)
- Always use async sessions: `async with async_session_maker() as session:`

### UI Components
- Use Radix UI primitives and shadcn components from `@/components/ui/*`
- Follow existing component patterns with variant props
- AI elements in `@/components/ai-elements/*`

### Testing
- Backend: pytest with async support
- Frontend: No tests configured yet (add Jest/Vitest as needed)

## File Structure
```
backend/main.py          # FastAPI entry point, /api/chat SSE endpoint
backend/app/db.py        # SQLAlchemy async setup, User model
backend/app/models.py    # Conversation, Message SQLAlchemy models
backend/app/schemas.py   # Pydantic request/response schemas
backend/app/users.py     # FastAPI-Users JWT auth setup
frontend/app/            # Next.js App Router pages
frontend/components/ui/  # Radix UI/Shadcn components
frontend/hooks/          # Custom React hooks (use-chat.ts, use-authed-fetch.ts)
frontend/lib/utils.ts    # cn() utility for className merging
```
