# AI Nexus Development Guide

Complete guide for developers working on the AI Nexus project.

## Prerequisites

- **Node.js** 18+ or **Bun** (recommended)
- **Python** 3.13+
- **uv** - Python package manager
- **Git**

## Quick Start

```bash
# Clone repository
git clone <repository-url>
cd ai-nexus

# Install dependencies
bun install              # Root + Frontend
cd backend && uv sync    # Backend

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your values

# Start development servers
bun dev                  # Starts both frontend and backend
```

## Development Commands

### Root Level

```bash
bun dev              # Start frontend (3001) + backend (8000)
bun frontend:dev     # Start only frontend
bun dev:backend      # Start only backend
```

### Frontend (`/frontend`)

```bash
cd frontend

bun dev              # Development server
bun build            # Production build
bun lint             # Run ESLint
bun start            # Start production server
```

### Backend (`/backend`)

```bash
cd backend

uv run fastapi dev main.py    # Development with hot reload
uv run pytest                 # Run all tests
uv run pytest tests/test_x.py # Run specific test file
uv run pytest -v              # Verbose output
```

## Project Structure

```
ai-nexus/
├── backend/                    # FastAPI Python backend
│   ├── main.py                 # Application entry point
│   ├── app/
│   │   ├── db.py               # Database configuration
│   │   ├── models.py           # SQLAlchemy ORM models
│   │   ├── schemas.py          # Pydantic validation schemas
│   │   ├── users.py            # FastAPI-Users auth setup
│   │   └── crud/               # Database operations
│   │       ├── conversation.py
│   │       └── message.py
│   ├── tests/                  # Pytest tests
│   ├── pyproject.toml          # Python dependencies
│   └── .env                    # Environment variables
│
├── frontend/                   # Next.js React frontend
│   ├── app/                    # App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── c/[conversationId]/ # Dynamic chat route
│   ├── components/
│   │   ├── chat/chat.tsx       # Main chat component
│   │   ├── ai-elements/        # AI-specific components
│   │   └── ui/                 # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities
│   ├── package.json
│   └── .env                    # Environment variables
│
├── docs/                       # Documentation
├── dev.ts                      # Development runner script
├── package.json                # Root package.json
└── CLAUDE.md                   # AI assistant instructions
```

## Environment Configuration

### Backend (`backend/.env`)

```bash
# Required
AUTH_SECRET=your-jwt-secret-key-here
GOOGLE_API_KEY=your-google-gemini-api-key

# Optional
ENV=dev                         # 'dev' or 'prod' (controls secure cookies)
```

**Getting API Keys:**

1. **GOOGLE_API_KEY** - Get from [Google AI Studio](https://aistudio.google.com/apikey)
2. **AUTH_SECRET** - Generate a random string: `openssl rand -hex 32`

### Frontend (`frontend/.env`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Code Patterns

### Backend Patterns

#### Adding a New Endpoint

```python
# backend/main.py

from app.schemas import NewRequestSchema, NewResponseSchema
from app.crud.new_resource import create_new_resource

@app.post("/api/v1/resources", response_model=NewResponseSchema)
async def create_resource(
    request: NewRequestSchema,
    user: User = Depends(current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    return await create_new_resource(db, user.id, request)
```

#### Adding a New Schema

```python
# backend/app/schemas.py

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class NewResourceCreate(BaseModel):
    name: str
    description: str | None = None

class NewResourceResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

#### Adding a New Model

```python
# backend/app/models.py

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, ForeignKey
from uuid import UUID, uuid4
from datetime import datetime

class NewResource(Base):
    __tablename__ = "new_resources"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
```

#### Adding CRUD Operations

```python
# backend/app/crud/new_resource.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.models import NewResource
from app.schemas import NewResourceCreate

async def create_new_resource(
    db: AsyncSession,
    user_id: UUID,
    data: NewResourceCreate
) -> NewResource:
    resource = NewResource(
        user_id=user_id,
        name=data.name,
        description=data.description
    )
    db.add(resource)
    await db.commit()
    await db.refresh(resource)
    return resource

async def get_resources_for_user(
    db: AsyncSession,
    user_id: UUID
) -> list[NewResource]:
    result = await db.execute(
        select(NewResource)
        .where(NewResource.user_id == user_id)
        .order_by(NewResource.created_at.desc())
    )
    return list(result.scalars().all())
```

### Frontend Patterns

#### Adding a New Page

```typescript
// frontend/app/new-page/page.tsx

import { NewComponent } from "@/components/new-component";

export default function NewPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">New Page</h1>
      <NewComponent />
    </main>
  );
}
```

#### Adding a New Hook

```typescript
// frontend/hooks/use-new-resource.ts

import { useAuthedFetch } from "./use-authed-fetch";
import { API_BASE_URL } from "@/lib/api";

interface NewResource {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
}

export function useNewResource() {
    const authedFetch = useAuthedFetch();

    async function createResource(
        name: string,
        description?: string,
    ): Promise<NewResource> {
        const response = await authedFetch(`${API_BASE_URL}/api/v1/resources`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description }),
        });

        return response.json();
    }

    async function getResources(): Promise<NewResource[]> {
        const response = await authedFetch(`${API_BASE_URL}/api/v1/resources`);
        return response.json();
    }

    return { createResource, getResources };
}
```

#### Adding a New Component

```typescript
// frontend/components/new-component.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewComponentProps {
  initialValue?: string;
  onSubmit: (value: string) => void;
}

export function NewComponent({ initialValue = "", onSubmit }: NewComponentProps) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit(value);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter value..."
      />
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Loading..." : "Submit"}
      </Button>
    </div>
  );
}
```

## Database Migrations

Currently, the project uses SQLAlchemy's `create_all()` for automatic table creation. For production, consider adding Alembic:

```bash
cd backend
uv add alembic

# Initialize Alembic
uv run alembic init alembic

# Create migration
uv run alembic revision --autogenerate -m "Add new table"

# Apply migrations
uv run alembic upgrade head
```

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=app

# Run specific test
uv run pytest tests/test_auth.py -v

# Run tests matching pattern
uv run pytest -k "test_login"
```

Example test file:

```python
# backend/tests/test_conversations.py

import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_create_conversation():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Login first
        response = await client.post("/auth/jwt/login", data={
            "username": "test@example.com",
            "password": "testpassword"
        })

        # Create conversation
        response = await client.post(
            "/api/v1/conversations",
            json={},
            cookies=response.cookies
        )

        assert response.status_code == 201
        assert "id" in response.json()
```

### Frontend Tests

```bash
cd frontend

# Add testing dependencies
bun add -D vitest @testing-library/react @testing-library/jest-dom

# Run tests
bun test
```

## Debugging

### Backend Debugging

```python
# Add breakpoint
import pdb; pdb.set_trace()

# Or use debugpy for VS Code
import debugpy
debugpy.listen(5678)
debugpy.wait_for_client()
```

### Frontend Debugging

1. Use browser DevTools (F12)
2. Add `console.log()` statements
3. Use React DevTools extension

### Database Debugging

```bash
# Open SQLite database
sqlite3 backend/agno.db

# List tables
.tables

# View schema
.schema conversations

# Query data
SELECT * FROM conversations LIMIT 5;
```

## Code Style

### Python

- Use type hints
- Follow PEP 8
- Use async/await for database operations
- Docstrings for public functions

### TypeScript

- Use TypeScript strict mode
- Prefer `interface` over `type` for objects
- Use functional components
- Extract hooks for reusable logic

### Commit Messages

Follow conventional commits:

```
feat: add conversation sidebar
fix: correct auth redirect loop
docs: update API documentation
refactor: extract message component
test: add conversation CRUD tests
```

## Troubleshooting

### "Module not found" errors

```bash
# Backend
cd backend && uv sync

# Frontend
cd frontend && bun install
```

### Database errors

```bash
# Reset database
rm backend/agno.db
# Restart backend (tables auto-create)
```

### CORS errors

Check that:

1. Backend is running on port 8000
2. Frontend is running on port 3001
3. CORS middleware is configured in `main.py`

**Note:** CORS is currently hardcoded to `localhost:3001`. For production, this needs to be made configurable (TODO Task #38).

### Auth cookie not working

1. Check `AUTH_SECRET` is set
2. Ensure cookies are enabled in browser
3. Check `ENV` variable (dev vs prod)
4. Session expires after 1 hour (TODO Task #61 to extend)

### Messages disappear on page refresh

This is a known limitation (TODO Task #28). Currently, messages are stored only in React state and Agno's database. The frontend doesn't fetch message history on page load yet.

### Login/signup forms don't show errors

Known UX issues (TODO Tasks #9, #10). Currently, login failures throw errors but don't display them in the UI.

### Chat endpoint security warning

⚠️ The `/api/chat` endpoint currently doesn't verify that the user owns the conversation they're chatting in (TODO Task #13). This is a security issue that should be addressed before production.

## Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Make changes following code patterns
3. Add tests for new functionality
4. Run linters: `bun lint` and `uv run ruff check`
5. Commit with conventional commit message
6. Create pull request

## Best Practices Learned

### Database Patterns

1. **Dual Database Architecture**: The app uses a single SQLite file (`agno.db`) shared between your SQLAlchemy models and Agno's internal tables. Use `conversation_id` as `session_id` in Agno to link them.

2. **Foreign Keys**: Always define foreign key relationships in models (added in commit 69f2823).

3. **Datetime Handling**: Use `datetime.utcnow()` or `datetime.now(timezone.utc)` instead of `datetime.now()` for consistency (TODO Task #36).

### Frontend Patterns

1. **Authenticated Fetch**: Always use `useAuthedFetch()` hook for protected endpoints. It handles credentials and 401 redirects automatically.

2. **Streaming**: The `useChat()` hook uses `TextDecoderStream` + async generators for parsing SSE events.

3. **Conversation ID from URL**: Use `params.conversationId` from the dynamic route rather than local state to ensure shareable URLs work correctly.

### Security Patterns

1. **JWT in httpOnly Cookies**: Tokens are never accessible to JavaScript, reducing XSS risk.

2. **Ownership Verification**: Always verify resource ownership before operations (see TODO Task #13 for incomplete implementation).

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [SQLAlchemy Async](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [FastAPI-Users](https://fastapi-users.github.io/fastapi-users/)
- [Agno Framework](https://docs.agno.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs/primitives)

---

_Last updated: 2026-02-03_
