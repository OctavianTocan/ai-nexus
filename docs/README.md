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

### Implemented

- User authentication (login, register)
- Conversation creation
- Streaming chat with Gemini

### In Progress

- Conversation list/sidebar
- Message history persistence
- Full CRUD operations

## Contributing

See the [Development Guide](DEVELOPMENT.md#contributing) for contribution guidelines.

## Support

For issues and questions:

1. Check [Troubleshooting](USER_GUIDE.md#troubleshooting)
2. Review [TODO.md](../TODO.md) for known issues
3. Open an issue in the repository
