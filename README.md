# AI Nexus

A "second brain" chatbot with real-time streaming LLM responses, built with Next.js and FastAPI.

## Features

- **Streaming Chat** - Real-time AI responses via Server-Sent Events
- **Conversation Management** - Create and organize multiple conversations
- **Secure Authentication** - JWT-based auth with httpOnly cookies
- **Modern Stack** - Next.js 16, React 19, FastAPI, Tailwind CSS 4

## Tech Stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Frontend | Next.js 16, React 19, Tailwind 4 |
| Backend  | FastAPI, Python 3.13             |
| AI       | Agno framework, Google Gemini    |
| Auth     | FastAPI-Users (JWT cookies)      |
| Database | SQLite + aiosqlite               |
| UI       | Radix UI, Shadcn                 |

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) (JavaScript runtime)
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- Python 3.13+
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-nexus

# Install dependencies
bun install
cd backend && uv sync && cd ..

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your API keys
```

### Development

```bash
# Start both frontend and backend
bun dev

# Frontend only (port 3001)
bun frontend:dev

# Backend only (port 8000)
bun dev:backend
```

Visit [http://localhost:3001](http://localhost:3001) to use the app.

## Environment Variables

### Backend (`backend/.env`)

```bash
AUTH_SECRET=your-jwt-secret      # Required: JWT signing key
GOOGLE_API_KEY=your-gemini-key   # Required: Google AI API key
ENV=dev                          # Optional: 'dev' or 'prod'
```

### Frontend (`frontend/.env`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
ai-nexus/
├── backend/           # FastAPI Python backend
│   ├── main.py        # API entry point
│   └── app/           # Models, schemas, auth
├── frontend/          # Next.js React frontend
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   └── hooks/         # Custom hooks
└── docs/              # Documentation
```

## Documentation

- [API Reference](docs/API.md) - Complete API documentation
- [Architecture](docs/ARCHITECTURE.md) - System design and diagrams
- [Development Guide](docs/DEVELOPMENT.md) - Developer setup and patterns
- [User Guide](docs/USER_GUIDE.md) - End-user documentation
- [OpenAPI Spec](docs/openapi.yaml) - API specification

## Commands

```bash
# Development
bun dev                  # Start all services
bun frontend:dev         # Frontend only
bun dev:backend          # Backend only

# Frontend
cd frontend
bun build                # Production build
bun lint                 # Run ESLint

# Backend
cd backend
uv run pytest            # Run tests
uv run pytest -v         # Verbose tests
```

## API Overview

| Endpoint                | Method | Description         |
| ----------------------- | ------ | ------------------- |
| `/auth/jwt/login`       | POST   | User login          |
| `/auth/register`        | POST   | User registration   |
| `/api/v1/conversations` | POST   | Create conversation |
| `/api/chat`             | POST   | Stream chat (SSE)   |

See [API Documentation](docs/API.md) for full details.

## Architecture

```
┌───────────┐     ┌───────────┐     ┌───────────┐
│  Browser  │────►│  Next.js  │────►│  FastAPI  │
│           │     │   :3001   │     │   :8000   │
└───────────┘     └───────────┘     └─────┬─────┘
                                          │
                                          ▼
                                    ┌───────────┐
                                    │   Agno    │
                                    │ + Gemini  │
                                    └───────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Open a Pull Request

## License

MIT
