# AI Nexus v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform AI Nexus from a basic Gemini chatbot into a polished, multi-model, MCP-powered, fully configurable AI chat platform.

**Architecture:** Modular backend with provider adapters for multi-model support, MCP server manager for tool integrations, and a settings system for deep configurability. Frontend gets a theme engine, rich markdown rendering, keyboard-first UX, and polished micro-interactions.

**Tech Stack:** Next.js 16 + React 19, FastAPI + SQLAlchemy (async), Agno agent framework, MCP protocol, TanStack Query, Tailwind v4, Motion.js, Shiki, shadcn/ui.

**Design doc:** `docs/plans/2026-02-27-ai-nexus-v2-design.md`

---

## Epic Overview & Dependency Graph

```
Epic 1: Backend Restructure ─────────────┐
Epic 2: Database Schema Expansion ────────┤
                                          ├─→ Epic 3: Multi-Model Providers
                                          ├─→ Epic 4: Settings API & UI
                                          │       ├─→ Epic 5: Theme System
                                          │       └─→ Epic 9: Personas
                                          ├─→ Epic 7: MCP Tool System
                                          └─→ Epic 13: Data Management
Epic 6: Chat UX Polish ──────── (independent)
Epic 8: Keyboard & Navigation ─ (independent)
Epic 10: Advanced Chat ──────── (depends on Epic 3)
Epic 11: Empty States ───────── (depends on Epic 9)
Epic 12: Responsive & Mobile ── (independent)
```

Epics 1-2 are the foundation. Everything else builds on top. Epics 6, 8, 12 are independent UI work that can be parallelized.

---

## Epic 1: Backend Restructure

**Why:** The current backend is a monolithic `main.py` (~300 lines) with all routes, agent config, and streaming logic in one file. Before adding multi-model, settings, and MCP features, we need to split this into a modular structure.

**Current state:** Single `main.py` with all routes. Separate `app/db.py`, `app/models.py`, `app/schemas.py`, `app/users.py`, `app/crud/conversation.py`.

**Target structure:**
```
backend/
  main.py                          # App factory only (create_app, include_router, lifespan)
  app/
    api/
      __init__.py
      router.py                    # Main API router that includes all sub-routers
      chat.py                      # POST /api/chat (SSE streaming)
      conversations.py             # /api/v1/conversations/* CRUD
    core/
      __init__.py
      config.py                    # Settings from env vars (pydantic-settings)
      agents.py                    # Agno agent factory
    db.py                          # (existing) engine, session, User model
    models.py                      # (existing) Conversation model
    schemas.py                     # (existing) Pydantic schemas
    users.py                       # (existing) FastAPI-Users config
    crud/
      __init__.py
      conversation.py              # (existing) conversation CRUD
```

### Task 1.1: Create config module

**Files:**
- Create: `backend/app/core/__init__.py`
- Create: `backend/app/core/config.py`

**Step 1: Write the test**

```python
# backend/tests/test_config.py
from app.core.config import settings


def test_settings_loads_defaults():
    """Settings should have sensible defaults."""
    assert settings.app_name == "AI Nexus"
    assert settings.cors_origins is not None
    assert settings.database_url.startswith("sqlite")


def test_settings_auth_secret_required():
    """AUTH_SECRET must be set (will come from env in prod)."""
    assert settings.auth_secret is not None
```

**Step 2: Run test to verify it fails**

Run: `cd backend && uv run pytest tests/test_config.py -v`
Expected: FAIL - `ModuleNotFoundError: No module named 'app.core'`

**Step 3: Implement config module**

```python
# backend/app/core/__init__.py
```

```python
# backend/app/core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    app_name: str = "AI Nexus"
    env: str = "dev"

    # Auth
    auth_secret: str = "CHANGE-ME-IN-PRODUCTION"

    # Database
    database_url: str = "sqlite+aiosqlite:///./agno.db"

    # CORS
    cors_origins: list[str] = ["http://localhost:3001"]

    # Google Gemini
    google_api_key: str = ""

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
```

**Step 4: Run test to verify it passes**

Run: `cd backend && uv run pytest tests/test_config.py -v`
Expected: PASS

Note: You may need to `uv add pydantic-settings` first.

**Step 5: Commit**

```bash
git add backend/app/core/ backend/tests/test_config.py
git commit -m "feat(backend): add pydantic-settings config module"
```

---

### Task 1.2: Create API router module

**Files:**
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/router.py`
- Create: `backend/app/api/conversations.py`

**Step 1: Extract conversation routes**

Currently in `main.py` lines ~86-210. Move all `/api/v1/conversations` routes to a dedicated module.

```python
# backend/app/api/__init__.py
```

```python
# backend/app/api/conversations.py
"""Conversation CRUD endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.conversation import (
    create_conversation_service,
    get_conversation_service,
    get_conversations_for_user_service,
    update_conversation_title_service,
)
from app.db import User, get_async_session
from app.schemas import ConversationCreate, ConversationResponse
from app.users import current_active_user

router = APIRouter(prefix="/api/v1/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationResponse])
async def list_conversations(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """List all conversations for the current user."""
    return await get_conversations_for_user_service(
        user_id=user.id, session=session
    )


@router.post("/{conversation_id}", response_model=ConversationResponse)
async def create_conversation(
    conversation_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Create a new conversation with a pre-generated ID."""
    conversation = await create_conversation_service(
        conversation_id=conversation_id,
        user_id=user.id,
        session=session,
    )
    if conversation is None:
        raise HTTPException(status_code=409, detail="Conversation already exists")
    return conversation


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Get a single conversation by ID."""
    conversation = await get_conversation_service(
        conversation_id=conversation_id,
        user_id=user.id,
        session=session,
    )
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.post("/{conversation_id}/title")
async def generate_title(
    conversation_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Generate a title for a conversation using the first message."""
    from agno.agent import Agent
    from agno.models.google import Gemini
    from agno.storage.sqlite import SqliteDb

    agno_db = SqliteDb(db_file="agno.db")
    title_agent = Agent(
        model=Gemini(id="gemini-3-flash-preview"),
        db=agno_db,
    )

    # Get chat history for title generation
    history = title_agent.get_chat_history(session_id=str(conversation_id))
    if not history:
        raise HTTPException(status_code=400, detail="No messages to generate title from")

    first_message = history[0].get("content", "")
    title_response = title_agent.run(
        f"Generate a short, concise title (max 6 words) for a conversation that starts with: '{first_message}'. Reply with ONLY the title, nothing else.",
    )
    title = title_response.content.strip().strip('"')

    await update_conversation_title_service(
        conversation_id=conversation_id,
        user_id=user.id,
        title=title,
        session=session,
    )
    return {"title": title}
```

```python
# backend/app/api/router.py
"""Main API router - includes all sub-routers."""

from fastapi import APIRouter

from app.api.conversations import router as conversations_router

api_router = APIRouter()
api_router.include_router(conversations_router)
```

**Step 2: Run existing tests (if any) to make sure nothing breaks**

Run: `cd backend && uv run pytest -v`

**Step 3: Commit**

```bash
git add backend/app/api/
git commit -m "refactor(backend): extract conversation routes to api module"
```

---

### Task 1.3: Extract chat endpoint

**Files:**
- Create: `backend/app/api/chat.py`
- Create: `backend/app/core/agents.py`

**Step 1: Create agent factory**

```python
# backend/app/core/agents.py
"""Agno agent factory for creating chat agents."""

from agno.agent import Agent
from agno.models.google import Gemini
from agno.storage.sqlite import SqliteDb
from agno.tools.mcp import MCPTools


def create_chat_agent(
    user_id: str,
    session_id: str,
) -> Agent:
    """Create an Agno agent configured for chat."""
    agno_db = SqliteDb(db_file="agno.db")

    return Agent(
        name="Agno Agent",
        user_id=user_id,
        session_id=session_id,
        model=Gemini(id="gemini-3-flash-preview"),
        db=agno_db,
        tools=[MCPTools(transport="streamable-http", url="https://docs.agno.com/mcp")],
        add_history_to_context=True,
        num_history_runs=3,
        markdown=True,
    )
```

**Step 2: Extract chat route**

```python
# backend/app/api/chat.py
"""Chat endpoint with SSE streaming."""

import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.agents import create_chat_agent
from app.crud.conversation import get_conversation_service
from app.db import User, get_async_session
from app.schemas import ChatRequest
from app.users import current_active_user

router = APIRouter(tags=["chat"])


@router.post("/api/chat")
async def chat(
    request: ChatRequest,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Stream a chat response using SSE."""
    conversation = await get_conversation_service(
        conversation_id=request.conversation_id,
        user_id=user.id,
        session=session,
    )
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    agent = create_chat_agent(
        user_id=str(user.id),
        session_id=str(request.conversation_id),
    )

    def event_stream():
        """Yield SSE-formatted chunks from the Agno agent."""
        for ev in agent.run(request.question, stream=True):
            chunk = getattr(ev, "content", None)
            if chunk:
                payload = {"type": "delta", "content": chunk}
                yield f"data: {json.dumps(payload)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
```

**Step 3: Update router.py to include chat**

```python
# backend/app/api/router.py
"""Main API router - includes all sub-routers."""

from fastapi import APIRouter

from app.api.chat import router as chat_router
from app.api.conversations import router as conversations_router

api_router = APIRouter()
api_router.include_router(conversations_router)
api_router.include_router(chat_router)
```

**Step 4: Commit**

```bash
git add backend/app/api/chat.py backend/app/core/agents.py backend/app/api/router.py
git commit -m "refactor(backend): extract chat endpoint and agent factory"
```

---

### Task 1.4: Slim down main.py to app factory

**Files:**
- Modify: `backend/main.py`

**Step 1: Rewrite main.py as app factory**

```python
# backend/main.py
"""FastAPI application factory."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db import create_db_and_tables
from app.schemas import UserCreate, UserRead, UserUpdate
from app.users import auth_backend, fastapi_users


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, lifespan=lifespan)

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Auth routes
    app.include_router(
        fastapi_users.get_auth_router(auth_backend),
        prefix="/auth/jwt",
        tags=["auth"],
    )
    app.include_router(
        fastapi_users.get_register_router(UserRead, UserCreate),
        prefix="/auth",
        tags=["auth"],
    )
    app.include_router(
        fastapi_users.get_users_router(UserRead, UserUpdate),
        prefix="/users",
        tags=["users"],
    )

    # API routes
    app.include_router(api_router)

    return app


app = create_app()
```

**Step 2: Update db.py to use config**

Replace the hardcoded `DATABASE_URL` in `backend/app/db.py` with:
```python
from app.core.config import settings

DATABASE_URL = settings.database_url
```

**Step 3: Update users.py to use config**

Replace hardcoded `AUTH_SECRET` in `backend/app/users.py` with:
```python
from app.core.config import settings

# In get_jwt_strategy():
return JWTStrategy(secret=settings.auth_secret, lifetime_seconds=3600)
```

**Step 4: Verify the app starts**

Run: `cd backend && uv run fastapi dev main.py`
Expected: App starts on port 8000 with all routes working

**Step 5: Verify frontend still works**

Run: `cd frontend && bun dev`
Expected: Can login, create conversation, chat with streaming

**Step 6: Commit**

```bash
git add backend/main.py backend/app/db.py backend/app/users.py
git commit -m "refactor(backend): slim main.py to app factory, use config module"
```

---

## Epic 2: Database Schema Expansion

**Why:** Multi-model support, settings, personas, and tool tracking all need new tables.

### Task 2.1: Add UserSettings model

**Files:**
- Modify: `backend/app/models.py`
- Create: `backend/tests/test_models.py`

**Step 1: Write the test**

```python
# backend/tests/test_models.py
import uuid

from app.models import UserSettings


def test_user_settings_defaults():
    """UserSettings should have sensible defaults."""
    user_id = uuid.uuid4()
    s = UserSettings(user_id=user_id)
    assert s.theme == "system"
    assert s.accent_color == "blue"
    assert s.font_size == "medium"
    assert s.chat_width == "comfortable"
    assert s.default_model == "gemini-3-flash-preview"
```

**Step 2: Run test to verify it fails**

Run: `cd backend && uv run pytest tests/test_models.py::test_user_settings_defaults -v`
Expected: FAIL - `ImportError: cannot import name 'UserSettings'`

**Step 3: Add UserSettings model**

Add to `backend/app/models.py`:

```python
class UserSettings(Base):
    """User preferences and settings."""

    __tablename__ = "user_settings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), unique=True, index=True
    )

    # Appearance
    theme: Mapped[str] = mapped_column(String(20), default="system")
    accent_color: Mapped[str] = mapped_column(String(20), default="blue")
    font_size: Mapped[str] = mapped_column(String(10), default="medium")
    chat_width: Mapped[str] = mapped_column(String(20), default="comfortable")
    message_density: Mapped[str] = mapped_column(String(20), default="comfortable")

    # AI
    default_model: Mapped[str] = mapped_column(
        String(100), default="gemini-3-flash-preview"
    )

    # Timestamps
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
```

**Step 4: Run test to verify it passes**

Run: `cd backend && uv run pytest tests/test_models.py::test_user_settings_defaults -v`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/models.py backend/tests/test_models.py
git commit -m "feat(backend): add UserSettings model"
```

---

### Task 2.2: Add ApiKey model

**Files:**
- Modify: `backend/app/models.py`

**Step 1: Write the test**

```python
# backend/tests/test_models.py (append)
def test_api_key_model():
    """ApiKey should store encrypted keys per provider."""
    user_id = uuid.uuid4()
    key = ApiKey(user_id=user_id, provider="anthropic", encrypted_key="enc_xxx")
    assert key.provider == "anthropic"
    assert key.encrypted_key == "enc_xxx"
    assert key.is_active is True
```

**Step 2: Run test to verify it fails**

Run: `cd backend && uv run pytest tests/test_models.py::test_api_key_model -v`
Expected: FAIL

**Step 3: Add ApiKey model**

```python
class ApiKey(Base):
    """Encrypted API keys per provider per user."""

    __tablename__ = "api_keys"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), index=True
    )
    provider: Mapped[str] = mapped_column(String(50))  # "anthropic", "openai", "google"
    encrypted_key: Mapped[str] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "provider", name="uq_user_provider"),
    )
```

**Step 4: Run test, verify pass, commit**

```bash
git commit -m "feat(backend): add ApiKey model for encrypted provider keys"
```

---

### Task 2.3: Add Persona model

**Files:**
- Modify: `backend/app/models.py`

**Step 1: Write the test**

```python
def test_persona_model():
    """Persona stores custom system prompts with model preference."""
    user_id = uuid.uuid4()
    p = Persona(
        user_id=user_id,
        name="Code Helper",
        system_prompt="You are an expert programmer.",
        model="claude-sonnet-4-6",
        icon="code",
    )
    assert p.name == "Code Helper"
    assert p.is_builtin is False
```

**Step 2: Add Persona model**

```python
class Persona(Base):
    """Custom or built-in chat personas with system prompts."""

    __tablename__ = "personas"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), nullable=True, index=True
    )  # NULL for built-in personas
    name: Mapped[str] = mapped_column(String(100))
    system_prompt: Mapped[str] = mapped_column(Text)
    model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    icon: Mapped[str] = mapped_column(String(50), default="bot")
    is_builtin: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

**Step 3: Run test, verify pass, commit**

```bash
git commit -m "feat(backend): add Persona model for system prompts"
```

---

### Task 2.4: Add ToolEvent model and expand Conversation

**Files:**
- Modify: `backend/app/models.py`

**Step 1: Write the test**

```python
def test_tool_event_model():
    """ToolEvent logs MCP tool calls within conversations."""
    t = ToolEvent(
        conversation_id=uuid.uuid4(),
        tool_name="web_search",
        tool_input={"query": "python asyncio"},
        tool_output={"results": []},
        status="success",
    )
    assert t.tool_name == "web_search"
    assert t.status == "success"
```

**Step 2: Add ToolEvent model**

```python
class ToolEvent(Base):
    """Log of MCP tool calls within conversations."""

    __tablename__ = "tool_events"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), index=True
    )
    tool_name: Mapped[str] = mapped_column(String(100))
    tool_input: Mapped[dict] = mapped_column(JSON, default=dict)
    tool_output: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(20))  # "pending", "success", "error"
    duration_ms: Mapped[int | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

**Step 3: Add model field to Conversation**

In the existing `Conversation` model, add:
```python
model: Mapped[str | None] = mapped_column(String(100), nullable=True)
persona_id: Mapped[uuid.UUID | None] = mapped_column(
    ForeignKey("personas.id", ondelete="SET NULL"), nullable=True
)
```

**Step 4: Run all model tests, verify pass, commit**

```bash
git commit -m "feat(backend): add ToolEvent model, expand Conversation with model field"
```

---

### Task 2.5: Update database initialization

**Files:**
- Modify: `backend/app/db.py`

**Step 1: Ensure all new models are imported before create_all**

In `backend/app/db.py`, make sure the `create_db_and_tables` function imports all models:

```python
async def create_db_and_tables():
    # Import all models so SQLAlchemy sees them
    import app.models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

**Step 2: Verify app starts and creates tables**

Run: `cd backend && uv run fastapi dev main.py`
Check: No errors, new tables created in agno.db

**Step 3: Commit**

```bash
git commit -m "feat(backend): ensure all models are loaded on startup"
```

---

## Epic 3: Multi-Model Provider System

**Why:** Currently hardcoded to Gemini. Need adapter pattern so users can switch between Gemini, Claude, and OpenAI.

### Task 3.1: Define provider interface and Gemini adapter

**Files:**
- Create: `backend/app/core/providers/__init__.py`
- Create: `backend/app/core/providers/base.py`
- Create: `backend/app/core/providers/gemini.py`
- Create: `backend/tests/test_providers.py`

**Step 1: Write the test**

```python
# backend/tests/test_providers.py
from app.core.providers.base import ModelProvider
from app.core.providers.gemini import GeminiProvider


def test_gemini_provider_creates_model():
    """GeminiProvider should return an Agno model instance."""
    provider = GeminiProvider()
    assert provider.provider_name == "google"
    models = provider.available_models()
    assert len(models) > 0
    assert any("gemini" in m["id"] for m in models)


def test_provider_registry():
    """Provider registry should return the right provider by name."""
    from app.core.providers import get_provider

    provider = get_provider("google")
    assert isinstance(provider, GeminiProvider)
```

**Step 2: Run test to verify it fails**

Run: `cd backend && uv run pytest tests/test_providers.py -v`

**Step 3: Implement base + Gemini**

```python
# backend/app/core/providers/base.py
"""Base class for LLM provider adapters."""

from abc import ABC, abstractmethod
from typing import Any


class ModelProvider(ABC):
    """Abstract base for model providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Unique provider identifier (e.g. 'google', 'anthropic', 'openai')."""
        ...

    @abstractmethod
    def available_models(self) -> list[dict[str, str]]:
        """Return list of available models with id and display name."""
        ...

    @abstractmethod
    def create_model(self, model_id: str, api_key: str | None = None) -> Any:
        """Create an Agno-compatible model instance."""
        ...
```

```python
# backend/app/core/providers/gemini.py
"""Google Gemini provider adapter."""

from typing import Any

from agno.models.google import Gemini

from app.core.providers.base import ModelProvider


class GeminiProvider(ModelProvider):
    @property
    def provider_name(self) -> str:
        return "google"

    def available_models(self) -> list[dict[str, str]]:
        return [
            {"id": "gemini-3-flash-preview", "name": "Gemini 3 Flash"},
            {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash"},
            {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro"},
        ]

    def create_model(self, model_id: str, api_key: str | None = None) -> Any:
        kwargs = {"id": model_id}
        if api_key:
            kwargs["api_key"] = api_key
        return Gemini(**kwargs)
```

```python
# backend/app/core/providers/__init__.py
"""Provider registry."""

from app.core.providers.base import ModelProvider
from app.core.providers.gemini import GeminiProvider

_PROVIDERS: dict[str, ModelProvider] = {
    "google": GeminiProvider(),
}


def get_provider(name: str) -> ModelProvider:
    """Get a provider by name."""
    provider = _PROVIDERS.get(name)
    if not provider:
        raise ValueError(f"Unknown provider: {name}. Available: {list(_PROVIDERS.keys())}")
    return provider


def list_providers() -> list[dict]:
    """List all registered providers with their models."""
    result = []
    for provider in _PROVIDERS.values():
        result.append({
            "provider": provider.provider_name,
            "models": provider.available_models(),
        })
    return result


__all__ = ["ModelProvider", "get_provider", "list_providers"]
```

**Step 4: Run test, verify pass**

Run: `cd backend && uv run pytest tests/test_providers.py -v`

**Step 5: Commit**

```bash
git add backend/app/core/providers/ backend/tests/test_providers.py
git commit -m "feat(backend): add provider adapter pattern with Gemini provider"
```

---

### Task 3.2: Add Anthropic (Claude) provider

**Files:**
- Create: `backend/app/core/providers/anthropic.py`
- Modify: `backend/app/core/providers/__init__.py`

**Step 1: Install dependency**

Run: `cd backend && uv add agno[anthropic]` (or `uv add anthropic` if agno doesn't bundle it)

Check Agno docs for the correct import: likely `from agno.models.anthropic import Claude`

**Step 2: Write the test**

```python
# backend/tests/test_providers.py (append)
from app.core.providers.anthropic import AnthropicProvider


def test_anthropic_provider():
    provider = AnthropicProvider()
    assert provider.provider_name == "anthropic"
    models = provider.available_models()
    assert any("claude" in m["id"] for m in models)
```

**Step 3: Implement Anthropic provider**

```python
# backend/app/core/providers/anthropic.py
"""Anthropic Claude provider adapter."""

from typing import Any

from agno.models.anthropic import Claude

from app.core.providers.base import ModelProvider


class AnthropicProvider(ModelProvider):
    @property
    def provider_name(self) -> str:
        return "anthropic"

    def available_models(self) -> list[dict[str, str]]:
        return [
            {"id": "claude-sonnet-4-6", "name": "Claude Sonnet 4.6"},
            {"id": "claude-haiku-4-5-20251001", "name": "Claude Haiku 4.5"},
        ]

    def create_model(self, model_id: str, api_key: str | None = None) -> Any:
        kwargs = {"id": model_id}
        if api_key:
            kwargs["api_key"] = api_key
        return Claude(**kwargs)
```

**Step 4: Register in `__init__.py`**

Add to `_PROVIDERS`:
```python
from app.core.providers.anthropic import AnthropicProvider

_PROVIDERS: dict[str, ModelProvider] = {
    "google": GeminiProvider(),
    "anthropic": AnthropicProvider(),
}
```

**Step 5: Run test, verify pass, commit**

```bash
git commit -m "feat(backend): add Anthropic Claude provider adapter"
```

---

### Task 3.3: Add OpenAI provider

**Files:**
- Create: `backend/app/core/providers/openai.py`
- Modify: `backend/app/core/providers/__init__.py`

Same pattern as Task 3.2 but for OpenAI. Agno import is likely `from agno.models.openai import OpenAIChat`.

```python
# backend/app/core/providers/openai.py
"""OpenAI provider adapter."""

from typing import Any

from agno.models.openai import OpenAIChat

from app.core.providers.base import ModelProvider


class OpenAIProvider(ModelProvider):
    @property
    def provider_name(self) -> str:
        return "openai"

    def available_models(self) -> list[dict[str, str]]:
        return [
            {"id": "gpt-4o", "name": "GPT-4o"},
            {"id": "gpt-4o-mini", "name": "GPT-4o Mini"},
            {"id": "o3-mini", "name": "o3 Mini"},
        ]

    def create_model(self, model_id: str, api_key: str | None = None) -> Any:
        kwargs = {"id": model_id}
        if api_key:
            kwargs["api_key"] = api_key
        return OpenAIChat(**kwargs)
```

Register and test same as before.

```bash
git commit -m "feat(backend): add OpenAI provider adapter"
```

---

### Task 3.4: Update agent factory for multi-model

**Files:**
- Modify: `backend/app/core/agents.py`
- Modify: `backend/app/api/chat.py`

**Step 1: Update agent factory to accept model selection**

```python
# backend/app/core/agents.py
"""Agno agent factory for creating chat agents."""

from agno.agent import Agent
from agno.storage.sqlite import SqliteDb
from agno.tools.mcp import MCPTools

from app.core.providers import get_provider


def create_chat_agent(
    user_id: str,
    session_id: str,
    model_id: str = "gemini-3-flash-preview",
    provider_name: str = "google",
    api_key: str | None = None,
    system_prompt: str | None = None,
) -> Agent:
    """Create an Agno agent with the specified model provider."""
    agno_db = SqliteDb(db_file="agno.db")
    provider = get_provider(provider_name)
    model = provider.create_model(model_id, api_key=api_key)

    return Agent(
        name="AI Nexus Agent",
        user_id=user_id,
        session_id=session_id,
        model=model,
        db=agno_db,
        tools=[MCPTools(transport="streamable-http", url="https://docs.agno.com/mcp")],
        instructions=system_prompt if system_prompt else None,
        add_history_to_context=True,
        num_history_runs=3,
        markdown=True,
    )
```

**Step 2: Update ChatRequest schema to include model selection**

In `backend/app/schemas.py`, update:
```python
class ChatRequest(BaseModel):
    question: str
    conversation_id: uuid.UUID
    model_id: str | None = None        # e.g. "claude-sonnet-4-6"
    provider: str | None = None          # e.g. "anthropic"
```

**Step 3: Update chat endpoint to use model from request**

In `backend/app/api/chat.py`, update the agent creation:
```python
agent = create_chat_agent(
    user_id=str(user.id),
    session_id=str(request.conversation_id),
    model_id=request.model_id or "gemini-3-flash-preview",
    provider_name=request.provider or "google",
)
```

**Step 4: Add models listing endpoint**

```python
# backend/app/api/models.py
"""Model provider endpoints."""

from fastapi import APIRouter, Depends

from app.core.providers import list_providers
from app.db import User
from app.users import current_active_user

router = APIRouter(prefix="/api/v1/models", tags=["models"])


@router.get("")
async def get_available_models(user: User = Depends(current_active_user)):
    """List all available model providers and their models."""
    return list_providers()
```

Add to `backend/app/api/router.py`:
```python
from app.api.models import router as models_router
api_router.include_router(models_router)
```

**Step 5: Verify Gemini still works, commit**

```bash
git commit -m "feat(backend): multi-model agent factory with provider adapters"
```

---

### Task 3.5: Add model selector to frontend

**Files:**
- Create: `frontend/components/model-selector.tsx`
- Create: `frontend/hooks/use-models.ts`
- Modify: `frontend/features/chat/ChatContainer.tsx`
- Modify: `frontend/features/chat/ChatView.tsx`
- Modify: `frontend/lib/api.ts`
- Modify: `frontend/lib/types.ts`

**Step 1: Add API endpoint and types**

In `frontend/lib/api.ts`, add:
```typescript
models: {
    list: "/api/v1/models",
},
```

In `frontend/lib/types.ts`, add:
```typescript
export interface ModelInfo {
    id: string;
    name: string;
}

export interface ProviderInfo {
    provider: string;
    models: ModelInfo[];
}
```

**Step 2: Create useModels hook**

```typescript
// frontend/hooks/use-models.ts
"use client";

import { useAuthedQuery } from "@/hooks/use-authed-query";
import { API_ENDPOINTS } from "@/lib/api";
import type { ProviderInfo } from "@/lib/types";

export function useModels() {
    return useAuthedQuery<ProviderInfo[]>(["models"], API_ENDPOINTS.models.list);
}
```

**Step 3: Create ModelSelector component**

Build a dropdown using shadcn's `<Select>` that shows providers as groups with their models. Stores selected model as `{provider, modelId}` and passes it up via callback.

**Step 4: Wire into ChatContainer**

Add state for selected model, pass to `streamMessage()`, include in the POST body to `/api/chat`.

**Step 5: Add model badge to messages**

In `Message` component, optionally show a small badge with the model name.

**Step 6: Verify end-to-end, commit**

```bash
git commit -m "feat(frontend): add model selector and multi-model chat support"
```

---

## Epic 4: Settings API & UI

### Task 4.1: Settings CRUD endpoints

**Files:**
- Create: `backend/app/crud/settings.py`
- Create: `backend/app/api/settings.py`
- Create: `backend/app/schemas.py` (add settings schemas)

Build GET/PUT `/api/v1/settings` endpoints. GET returns current settings (creates defaults if none exist). PUT updates settings. Follow existing CRUD patterns in `conversation.py`.

### Task 4.2: API key management endpoints

**Files:**
- Create: `backend/app/crud/api_keys.py`
- Create: `backend/app/core/encryption.py`
- Modify: `backend/app/api/settings.py`

Build endpoints to store/retrieve/delete API keys. Keys are encrypted with Fernet (from `cryptography` package) using `AUTH_SECRET` as the base key. GET endpoint returns `{provider: "anthropic", is_set: true}` — never returns the actual key.

### Task 4.3: Settings page frontend

**Files:**
- Create: `frontend/app/(app)/settings/page.tsx`
- Create: `frontend/app/(app)/settings/layout.tsx`
- Create: `frontend/components/settings/general-settings.tsx`
- Create: `frontend/components/settings/model-settings.tsx`
- Create: `frontend/components/settings/appearance-settings.tsx`
- Create: `frontend/hooks/use-settings.ts`

Build a settings page with tabbed navigation (General, Models, Appearance). Use shadcn components. Follow the sidebar layout pattern.

### Task 4.4: API key management UI

**Files:**
- Create: `frontend/components/settings/api-key-form.tsx`

Build masked input fields for each provider's API key. Show "Set" / "Not set" status. Allow updating and clearing keys.

---

## Epic 5: Theme System & Dark Mode

### Task 5.1: Implement theme context and toggle

**Files:**
- Create: `frontend/components/theme-provider.tsx`
- Create: `frontend/hooks/use-theme.ts`
- Modify: `frontend/app/layout.tsx`
- Modify: `frontend/app/globals.css`

Use `next-themes` package for dark/light/system toggle. Extend existing CSS variables for proper dark mode support. Add toggle to sidebar footer and settings.

### Task 5.2: Accent color system

**Files:**
- Modify: `frontend/app/globals.css`
- Modify: `frontend/components/settings/appearance-settings.tsx`

Define CSS variable sets for each accent color (blue, purple, green, orange, red, pink). Apply via `data-accent` attribute on `<html>`. Persist choice via settings API.

### Task 5.3: Font size and chat width settings

**Files:**
- Modify: `frontend/app/globals.css`
- Modify: `frontend/components/settings/appearance-settings.tsx`

CSS variable-driven font scaling and max-width for chat container. Applied via data attributes.

---

## Epic 6: Chat UX Polish

### Task 6.1: Rich markdown rendering with Shiki

**Files:**
- Modify: `frontend/components/ai-elements/message.tsx`
- Create: `frontend/components/chat/code-block.tsx`

Replace basic markdown rendering with Shiki-powered syntax highlighting. Add copy button, language label, and line numbers to code blocks. Shiki is already installed.

### Task 6.2: Message actions (copy, regenerate, edit)

**Files:**
- Modify: `frontend/components/ai-elements/message.tsx`
- Modify: `frontend/features/chat/ChatContainer.tsx`

Add action buttons that appear on message hover: copy full message, regenerate (re-send last user message), edit (put message back in input). Use Motion.js for smooth reveal animation.

### Task 6.3: Streaming animation polish

**Files:**
- Create: `frontend/components/chat/thinking-indicator.tsx`
- Modify: `frontend/features/chat/ChatView.tsx`

Replace basic loader with a pulsing dot animation. Add smooth text reveal animation during streaming. Add "scroll to bottom" pill that appears when user scrolls up.

### Task 6.4: Skeleton loaders and toast notifications

**Files:**
- Create: `frontend/components/chat/chat-skeleton.tsx`
- Modify: `frontend/app/(app)/layout.tsx`

Add skeleton loading state for conversation list and chat history. Add toast provider (shadcn Sonner) for async notifications (title generated, error occurred, etc.).

---

## Epic 7: MCP Tool System

### Task 7.1: MCP server manager

**Files:**
- Create: `backend/app/core/mcp/manager.py`
- Create: `backend/app/core/mcp/config.py`

Build a manager that can start/stop MCP servers as subprocesses, route tool calls to the right server, and report available tools.

### Task 7.2: Tool call cards in chat UI

**Files:**
- Create: `frontend/components/tools/tool-card.tsx`
- Modify: `frontend/features/chat/hooks/use-chat.ts`

When the SSE stream includes tool call events, render collapsible cards showing tool name, input, and output. Smooth expand/collapse animation with Motion.js.

### Task 7.3: Tool settings UI

**Files:**
- Create: `frontend/components/settings/tool-settings.tsx`
- Modify: `frontend/app/(app)/settings/tools/page.tsx`

List available MCP tools with toggle switches. Show status (connected/disconnected). Allow adding custom MCP server URLs.

---

## Epic 8: Keyboard & Navigation

### Task 8.1: Command palette (Cmd+K)

**Files:**
- Create: `frontend/components/command-palette.tsx`
- Modify: `frontend/app/(app)/layout.tsx`

Use shadcn `<Command>` component. Actions: new conversation, search conversations, switch model, open settings, toggle theme.

### Task 8.2: Global keyboard shortcuts

**Files:**
- Create: `frontend/hooks/use-keyboard-shortcuts.ts`
- Modify: `frontend/app/(app)/layout.tsx`

Register: `Cmd+N` (new chat), `Cmd+/` (toggle sidebar), `Cmd+,` (settings), `Cmd+Shift+M` (model switcher).

### Task 8.3: Resizable sidebar

**Files:**
- Modify: `frontend/components/new-sidebar.tsx`

Make sidebar width draggable. Persist width preference. Double-click divider to reset.

---

## Epic 9: Personas System

### Task 9.1: Built-in personas seed data

**Files:**
- Create: `backend/app/core/personas.py`

Seed 4 built-in personas on startup: "Coding Assistant", "Writing Helper", "Creative Brainstormer", "Researcher". Each with a tuned system prompt.

### Task 9.2: Persona CRUD and selection

**Files:**
- Create: `backend/app/crud/personas.py`
- Create: `backend/app/api/personas.py`
- Create: `frontend/components/settings/persona-settings.tsx`
- Create: `frontend/components/chat/persona-picker.tsx`

CRUD endpoints for custom personas. Persona picker in empty chat state and in input area.

---

## Epic 10: Advanced Chat Features

### Task 10.1: Token counter in input

**Files:**
- Modify: `frontend/components/ai-elements/prompt-input.tsx`

Use Tokenlens (already installed) to show live token count as user types. Show remaining tokens based on model's context window.

### Task 10.2: Conversation forking

**Files:**
- Modify: `frontend/features/chat/ChatContainer.tsx`
- Modify: `backend/app/api/conversations.py`

"Fork from here" action on any message. Creates a new conversation with history up to that point. Backend endpoint to clone conversation history.

### Task 10.3: Regenerate with different model

**Files:**
- Modify: `frontend/features/chat/ChatContainer.tsx`

On regenerate action, show model picker. Re-send last user message with selected model.

---

## Epic 11: Empty States & Onboarding

### Task 11.1: Empty chat state redesign

**Files:**
- Create: `frontend/components/chat/empty-state.tsx`

Beautiful empty state with gradient text, suggested prompt cards, and persona quick-select. Animate in with Motion.js.

### Task 11.2: First-time onboarding

**Files:**
- Create: `frontend/components/onboarding/welcome-dialog.tsx`

Modal on first login: welcome message, set API keys, pick theme, choose default model. Dismissable, never shows again.

---

## Epic 12: Responsive & Mobile

### Task 12.1: Mobile sidebar as sheet

**Files:**
- Modify: `frontend/components/new-sidebar.tsx`

On mobile breakpoint, sidebar becomes a `<Sheet>` (bottom or side sheet). Touch-friendly close gesture.

### Task 12.2: Mobile-optimized chat

**Files:**
- Modify: `frontend/features/chat/ChatView.tsx`
- Modify: `frontend/components/ai-elements/prompt-input.tsx`

Full-width messages on mobile. Input sticks to bottom. Virtual keyboard handling.

---

## Epic 13: Data Management

### Task 13.1: Export conversations

**Files:**
- Create: `backend/app/api/export.py`
- Create: `frontend/components/settings/data-settings.tsx`

Export single conversation or all as JSON/Markdown. Download via browser.

### Task 13.2: Delete conversation and bulk delete

**Files:**
- Create: `backend/app/crud/conversation.py` (add delete)
- Modify: `backend/app/api/conversations.py`
- Modify: `frontend/components/nav-chats.tsx`

DELETE endpoint (from existing beans). Swipe-to-delete on mobile, right-click menu on desktop. "Delete all" in settings with confirmation dialog.

---

## Implementation Order (Recommended)

**Sprint A (Foundation):** Epics 1-2 (backend restructure + schema)
**Sprint B (Multi-Model):** Epic 3 (providers + model selector)
**Sprint C (Settings + Theme):** Epics 4-5 (settings API/UI + dark mode)
**Sprint D (Polish):** Epic 6 (chat UX) + Epic 8 (keyboard shortcuts)
**Sprint E (AI Power):** Epic 7 (MCP tools) + Epic 10 (advanced chat)
**Sprint F (Personalization):** Epic 9 (personas) + Epic 11 (empty states)
**Sprint G (Finishing):** Epics 12-13 (responsive + data management)

Each sprint is roughly independent after Sprint A. Sprint B depends on A. Everything else can be parallelized.
