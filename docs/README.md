# AI Nexus Documentation

Welcome to the AI Nexus documentation. This directory contains comprehensive documentation for the project.

## Documentation Index

| Document                            | Description                                      | Audience               |
| ----------------------------------- | ------------------------------------------------ | ---------------------- |
| [API Reference](API.md)             | Complete REST API documentation with examples    | Developers             |
| [Architecture](ARCHITECTURE.md)     | System design, diagrams, and technical decisions | Developers, Architects |
| [Development Guide](DEVELOPMENT.md) | Setup, coding patterns, and contribution guide   | Developers             |
| [User Guide](USER_GUIDE.md)         | End-user documentation and troubleshooting       | End Users              |
| [OpenAPI Spec](openapi.yaml)        | Machine-readable API specification               | Developers, Tools      |

## Quick Links

### For Developers

- [Quick Start](DEVELOPMENT.md#quick-start) - Get the project running locally
- [Code Patterns](DEVELOPMENT.md#code-patterns) - Backend and frontend coding conventions
- [API Endpoints](API.md#endpoints) - All available API endpoints
- [Database Schema](ARCHITECTURE.md#database-schema) - Entity relationships

### For Users

- [Getting Started](USER_GUIDE.md#getting-started) - Create account and start chatting
- [Tips](USER_GUIDE.md#tips-for-better-conversations) - Get better AI responses
- [Troubleshooting](USER_GUIDE.md#troubleshooting) - Common issues and solutions

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          AI Nexus                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐  │
│   │   Browser   │◄─────►│   Next.js   │◄─────►│   FastAPI   │  │
│   │   Client    │ HTTP  │   :3001     │ REST  │   :8000     │  │
│   └─────────────┘       └─────────────┘       └──────┬──────┘  │
│                                                      │         │
│                                                      ▼         │
│                         ┌─────────────┐       ┌─────────────┐  │
│                         │   SQLite    │◄─────►│   Agno      │  │
│                         │   agno.db   │       │  + Gemini   │  │
│                         └─────────────┘       └─────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Component      | Technology                                     |
| -------------- | ---------------------------------------------- |
| Frontend       | Next.js 16, React 19, Tailwind CSS 4, Radix UI |
| Backend        | FastAPI, Python 3.13, SQLAlchemy               |
| AI             | Agno framework, Google Gemini                  |
| Authentication | FastAPI-Users, JWT (httpOnly cookies)          |
| Database       | SQLite + aiosqlite                             |

## Key Features

- **Streaming Chat** - Real-time AI responses via Server-Sent Events (SSE)
- **Conversation Management** - Create, view, and organize conversations
- **Secure Authentication** - JWT tokens in httpOnly cookies
- **Modern UI** - Responsive design with Radix primitives

## Project Status

See [TODO.md](../TODO.md) for the current roadmap and implementation status.

**Overall Progress:** 11.8% complete (8/68 tasks)

### ✅ Implemented (Phase 0 - Foundation)

| Feature                          | Status | Notes                                       |
| -------------------------------- | ------ | ------------------------------------------- |
| User authentication (login)      | ✅     | JWT cookies via FastAPI-Users               |
| User registration                | ✅     | Basic registration flow                     |
| Conversation creation endpoint   | ✅     | POST /api/v1/conversations                  |
| Dynamic conversation routes      | ✅     | /c/[conversationId]                         |
| Chat component with conversation | ✅     | Accepts conversationId prop                 |
| Streaming chat with Gemini       | ✅     | SSE via Agno framework                      |
| useCreateConversation hook       | ✅     | Frontend conversation creation              |
| TypeScript API definitions       | ✅     | lib/api.ts                                  |
| Database foreign keys            | ✅     | User → Conversation → Message relationships |
| Environment templates            | ✅     | .env.example files created                  |

### 🚧 Sprint 1 - In Progress (Authentication & Navigation)

| Feature                       | Status | Task # |
| ----------------------------- | ------ | ------ |
| Login form error states       | ❌     | #9     |
| Signup form feedback          | ❌     | #10    |
| Auto-login after registration | ❌     | #11    |
| Backend code cleanup          | ❌     | #12    |
| GET conversations endpoint    | ❌     | #14-15 |
| Conversation sidebar          | ❌     | #18    |
| Widen chat layout             | ❌     | #19    |

### ⚠️ Known Security Issues

| Issue                               | Priority | Task # |
| ----------------------------------- | -------- | ------ |
| Chat endpoint lacks ownership check | 🔴 HIGH  | #13    |
| No rate limiting                    | 🟡 MED   | #37    |
| CORS hardcoded to localhost         | 🟡 MED   | #38    |

### 📋 Remaining Work by Priority

| Priority    | Tasks | Completion |
| ----------- | ----- | ---------- |
| 🔴 Critical | 12    | 0%         |
| 🟠 High     | 11    | 0%         |
| 🟡 Medium   | 13    | 0%         |
| 🟢 Low      | 24    | 0%         |

_Last updated: 2026-02-03_

## Contributing

See the [Development Guide](DEVELOPMENT.md#contributing) for contribution guidelines.

## Support

For issues and questions:

1. Check [Troubleshooting](USER_GUIDE.md#troubleshooting)
2. Review [TODO.md](../TODO.md) for known issues
3. Open an issue in the repository
