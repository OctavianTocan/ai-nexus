# Quickstart: AI Chat with User Authentication

**Feature**: 001-ai-chat-user-auth
**Date**: 2025-12-24

## Prerequisites

- Bun 1.2+ installed
- Python 3.13+ installed
- SQLite3 (comes with Python)
- Google Gemini API key (get from https://makersuite.google.com/app/apikey)
- Code editor with TypeScript and Python language support

## Project Structure

```
ai-nexus/
├── backend/          # Python FastAPI backend
│   ├── src/         # Source code
│   ├── tests/       # Backend tests
│   └── pyproject.toml
└── frontend/        # Next.js frontend
    ├── app/         # Next.js App Router
    ├── components/   # React components
    ├── tests/       # Frontend tests
    └── package.json
```

## Setup Steps

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd ai-nexus
git checkout 001-ai-chat-user-auth
```

### 2. Set Environment Variables

Create `.env` file in `backend/` directory:

```bash
cd backend
cat > .env << 'EOF'
# Google Gemini API Key (required for AI)
GOOGLE_API_KEY=your-gemini-api-key-here

# Session Configuration
SESSION_SECRET=your-secret-key-for-jwt-tokens-min-32-chars
SESSION_EXPIRE_HOURS=24

# Database (SQLite - no config needed)
DATABASE_URL=sqlite+aiosqlite:///agno.db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
EOF
```

**Important**: Replace `your-gemini-api-key-here` with your actual Google Gemini API key.
Generate a secure session secret with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

### 3. Install Backend Dependencies

```bash
cd backend
uv sync
```

This installs: FastAPI, Agno, Google GenAI, Pydantic, SQLAlchemy, passlib, python-jose, aiosqlite, alembic, pytest, httpx, mypy, ruff

### 4. Initialize Database

```bash
cd backend

# Initialize Alembic for migrations
alembic init alembic

# Generate initial migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head
```

This creates the `agno.db` SQLite database with users, conversations, messages, and sessions tables.

### 5. Install Frontend Dependencies

```bash
cd ../frontend
bun install
```

This installs: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, SWR, testing libraries, Storybook

### 6. Initialize Storybook (optional but recommended)

```bash
cd frontend
bunx storybook@latest init

# Follow prompts:
# - Framework: Next.js
# - Builder: Webpack 5
# - TypeScript: Yes
# - Styling: CSS (Tailwind)
```

### 7. Start Development Servers

**Terminal 1 - Start Backend:**

```bash
cd backend
uv run python main.py
```

Backend runs at http://localhost:8000

**Terminal 2 - Start Frontend:**

```bash
cd frontend
bun dev
```

Frontend runs at http://localhost:3000

**Terminal 3 - Start Storybook (optional):**

```bash
cd frontend
bun run storybook
```

Storybook runs at http://localhost:6006

## Verification

### 1. Check Backend Health

```bash
curl http://localhost:8000/health
```

Expected response: `{"status": "ok"}`

### 2. View API Documentation

Open http://localhost:8000/docs in your browser

This shows interactive API documentation powered by FastAPI.

### 3. Check Frontend

Open http://localhost:3000 in your browser

You should see the home page with login/register options.

### 4. Run Tests

**Backend Tests:**

```bash
cd backend
uv run pytest -v
```

**Frontend Tests:**

```bash
cd frontend
bun test
```

### 5. Run Type Checking

**Backend Type Check:**

```bash
cd backend
uv run mypy src/
```

**Frontend Type Check:**

```bash
cd frontend
bun run typecheck
```

## First Use: Create Account and Start Chat

### 1. Register

1. Open http://localhost:3000
2. Click "Sign Up"
3. Enter email: `test@example.com`
4. Enter password: `SecurePass123`
5. Submit

You should be redirected to chat list page.

### 2. Create First Chat

1. Click "New Chat" button
2. You'll be redirected to new conversation page
3. Type your first message: "Hello, AI assistant!"
4. Click Send

You should see your message and receive an AI response from Google Gemini.

### 3. Resume Conversation

1. Navigate back to chat list (click "Chats" in header)
2. Click on your conversation
3. Your message history should load
4. Send another message to continue

## Development Workflow

### Adding New Features

1. **Write tests first** (TDD principle)
2. Run tests to confirm they fail
3. Implement feature
4. Run tests again - they should pass
5. Add Storybook stories for UI components
6. Verify type checking passes
7. Commit with conventional commit message

### Running Quality Checks

**Before committing:**

```bash
# Backend
cd backend
uv run pytest                    # Tests
uv run mypy src/                # Type check
uv run ruff check src/           # Lint

# Frontend
cd frontend
bun test                         # Tests
bun run typecheck               # Type check
bun run lint                    # Lint (if configured)
```

### Database Migrations

When changing database schema:

```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Review generated migration in alembic/versions/

# Apply migration
alembic upgrade head
```

## Common Issues

### Port Already in Use

If port 8000 or 3000 is in use:

```bash
# Change backend port (edit backend/.env)
API_PORT=8001

# Change frontend port (edit frontend/next.config.ts or use flag)
bun dev --port 3001
```

### AI Service Errors

If AI responses fail:

1. Verify `GOOGLE_API_KEY` is set correctly in `backend/.env`
2. Check Google API console for quota limits
3. Review backend logs for error details

### Database Locked

If SQLite database is locked:

```bash
# Stop all running backend processes
pkill -f "python main.py"

# Check for existing connections
lsof agno.db

# Delete .lock file if exists
rm agno.db-journal  # or agno.db-wal
```

### CORS Errors

If frontend can't connect to backend:

1. Verify CORS is configured in `backend/src/main.py`
2. Check `API_HOST` and `API_PORT` in backend environment
3. Ensure frontend API client points to correct backend URL

## Next Steps

1. **Explore API**: Visit http://localhost:8000/docs to interact with API endpoints
2. **View Components**: Visit http://localhost:6006 to explore Storybook components
3. **Run Tests**: Execute `bun test` and `pytest` to see test coverage
4. **Read Code**: Review backend `src/` and frontend `app/`, `components/` directories
5. **Make Changes**: Try adding a new feature following TDD workflow

## Stopping Development

Press `Ctrl+C` in each terminal to stop services.

## Production Deployment Notes

This quickstart is for local development. For production deployment:

1. Replace SQLite with PostgreSQL
2. Use environment-specific config (staging, production)
3. Enable HTTPS for secure cookies
4. Set proper CORS origins
5. Configure rate limiting
6. Add monitoring and logging
7. Run database migrations with zero downtime
8. Set up CI/CD pipeline with quality gates

## Getting Help

- Check backend logs: `backend/` console output
- Check frontend logs: Browser Developer Tools → Console
- Review API docs: http://localhost:8000/docs
- Check test failures: `pytest -v` or `bun test` with detailed output
