# Implementation Plan: AI Chat with User Authentication

**Branch**: `001-ai-chat-user-auth` | **Date**: 2025-12-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-chat-user-auth/spec.md`

## Summary

This feature implements an AI chat application with user authentication, allowing users to create accounts, start AI conversations, send/receive messages, and resume past conversations. The system uses a modern stack with Next.js/React frontend and Python/FastAPI backend, implementing Shadcn/ai-elements components for a polished UI. Google Gemini powers the AI through Agno agents, with SQLite for data persistence.

**Reference Implementation Goals**: This project serves as a kickstarter and educational reference for developers building modern AI applications. The codebase demonstrates industry best practices across frontend (React 19, Next.js 16, TypeScript), backend (FastAPI, async/await, Pydantic), and AI integration (Agno framework, conversation management). All development follows TDD, includes comprehensive documentation, and showcases clean architecture patterns suitable for production use.

## Technical Context

**Language/Version**: Python 3.13+ for backend, TypeScript 5+ for frontend
**Primary Dependencies**:
  - Frontend: Next.js 16.1+, React 19.2.3+, shadcn/ui with ai-elements, Tailwind CSS 4+, Bun runtime
  - Backend: FastAPI 0.127+, Agno 2.3.21+, Google Gemini API, FastMCP 1.25.0+, Pydantic 2.12.5+, SQLAlchemy 2.0.45+
**Storage**: SQLite for user and chat data (via bun:sqlite for frontend access, SQLAlchemy async for backend)
**Testing**: bun test for frontend components, pytest with async support for backend
**Target Platform**: Web browsers (desktop and mobile)
**Project Type**: web application (frontend + backend monorepo)
**Performance Goals**: Message send/receive within 2 seconds (p95), chat creation within 1 second, support 100 concurrent users
**Constraints**: Session-based authentication with secure cookies, message size limits for reasonable usage, AI service timeout handling
**Scale/Scope**: 100 concurrent users initially, per-user data isolation, chat history retention 30+ days

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Test-Driven Development (TDD) Gate

- [x] Tests defined for all user stories BEFORE implementation begins
- [x] Test framework identified (bun test for frontend, pytest for backend)
- [x] Integration test strategy for API contracts (see contracts/*.yaml)
- [x] Unit test coverage plan for components and services (see research.md)

### Human-Written Code Gate

- [x] No AI-generated code dependencies in the implementation plan
- [x] Development approach emphasizes human understanding and authorship
- [x] Code review process includes human authorship verification

### Component Documentation (Storybook) Gate

- [x] Storybook configured for frontend components (see research.md and quickstart.md)
- [x] Every component in the plan has Storybook stories specified (auth, chat components)
- [x] Component API documentation planned through story metadata

### Modern Technology Stack Gate

- [x] Bun runtime usage confirmed for all JavaScript/TypeScript execution
- [x] Next.js 16+ and React 19+ for frontend features
- [x] Python 3.13+ with uv for backend dependencies (see research.md)
- [x] Type safety enforcement (TypeScript strict mode, Python type hints, Pydantic)

### Type Safety & Validation Gate

- [x] TypeScript strict mode enabled in frontend (package.json config)
- [x] Python type hints on all backend functions (data model defined with types)
- [x] Pydantic models for all API request/response schemas (contracts/*.yaml)
- [x] No `any` types or type ignores in the implementation plan

**Status**: ✅ All constitution gates passed. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-chat-user-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── auth.yaml        # Authentication endpoints
│   ├── chat.yaml        # Chat management endpoints
│   └── message.yaml     # Message handling endpoints
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── user.py          # User model
│   │   ├── conversation.py  # Chat conversation model
│   │   └── message.py       # Message model
│   ├── services/
│   │   ├── auth_service.py      # Authentication logic
│   │   ├── chat_service.py      # Chat management logic
│   │   └── ai_service.py       # AI agent integration (Agno + Gemini)
│   ├── api/
│   │   ├── deps.py          # FastAPI dependencies (auth, DB)
│   │   ├── routes/
│   │   │   ├── auth.py      # Registration, login, logout
│   │   │   ├── chat.py      # Chat CRUD operations
│   │   │   └── message.py   # Message send/receive
│   │   └── middleware.py    # Session validation
│   ├── database.py          # SQLAlchemy async configuration
│   ├── mcp/                 # FastMCP integration
│   │   └── server.py        # MCP server setup
│   └── main.py              # FastAPI app entry point
├── tests/
│   ├── unit/
│   │   ├── test_auth_service.py
│   │   ├── test_chat_service.py
│   │   └── test_ai_service.py
│   ├── integration/
│   │   ├── test_auth_routes.py
│   │   ├── test_chat_routes.py
│   │   └── test_message_routes.py
│   └── contract/
│       └── test_api_contracts.py
├── agno.db                  # SQLite database (created at runtime)
└── pyproject.toml           # Python dependencies

frontend/
├── app/
│   ├── layout.tsx            # Root layout with auth context
│   ├── page.tsx              # Home/landing page (redirects to login/chat list)
│   ├── login/
│   │   └── page.tsx          # Login form page
│   ├── register/
│   │   └── page.tsx          # Registration form page
│   ├── chat/
│   │   ├── page.tsx          # Chat list page (protected)
│   │   └── [id]/
│   │       └── page.tsx      # Individual chat conversation page
│   └── globals.css           # Global Tailwind styles
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx     # Login form component (ai-elements)
│   │   └── RegisterForm.tsx   # Registration form component (ai-elements)
│   ├── chat/
│   │   ├── ChatList.tsx      # List of user's conversations (ai-elements)
│   │   ├── ChatItem.tsx      # Single conversation item (ai-elements)
│   │   ├── ChatView.tsx      # Active conversation view (ai-elements)
│   │   ├── MessageList.tsx   # Message display (ai-elements)
│   │   ├── MessageInput.tsx   # Message composition (ai-elements)
│   │   └── MessageBubble.tsx  # Individual message (ai-elements)
│   └── ui/                   # Shadcn/ui components (already imported)
├── lib/
│   ├── api.ts                # API client functions
│   ├── auth.ts               # Authentication utilities (session management)
│   └── utils.ts              # Shared utilities
├── tests/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.test.tsx
│   │   │   └── RegisterForm.test.tsx
│   │   └── chat/
│   │       ├── ChatList.test.tsx
│   │       ├── ChatView.test.tsx
│   │       └── MessageInput.test.tsx
│   └── integration/
│       └── api.test.ts
└── package.json              # Frontend dependencies
```

**Structure Decision**: Web application structure with separate frontend (Next.js) and backend (FastAPI) directories. Frontend uses Next.js App Router for page routing, backend uses FastAPI for REST API. Both share SQLite database for data persistence.

## Complexity Tracking

> No constitution violations requiring justification. All technology choices align with AI Nexus Constitution principles.
