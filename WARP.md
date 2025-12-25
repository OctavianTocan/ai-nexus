# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## System Overview

This project is a hybrid application consisting of a **Next.js frontend** and a **FastAPI backend**.
- **Frontend**: Managed by Bun, runs on port 3001.
- **Backend**: Managed by `uv`, runs on port 8000.
- **Orchestration**: The root `dev.ts` script (via Bun) manages concurrent execution of both services.

## Architecture

- **`frontend/`**: A Next.js 16+ application using React 19 and Tailwind CSS v4.
- **`backend/`**: A Python 3.13+ application using FastAPI and Agno for AI agent capabilities.
- **`dev.ts`**: The main entry point for development, handling cleanup and concurrent startup of services.

## Development

### Prerequisites
- **Bun**: Required for frontend and orchestration.
- **uv**: Required for backend Python dependency management.

### Setup
Initialize dependencies for both parts of the stack:

```bash
# Frontend & Root
bun install

# Backend
cd backend
uv sync
cd ..
```

### Running the Application
To start both the frontend and backend servers simultaneously:

```bash
bun dev
```
This script (`dev.ts`) will:
1. Kill existing processes on ports 3001 and 8000.
2. Clear Next.js dev locks.
3. Start the Next.js frontend (`bun --cwd frontend dev`).
4. Start the FastAPI backend (`uv run --project backend fastapi dev backend/main.py`).

### Running Services Individually
If you need to run them separately:

**Frontend Only:**
```bash
bun run frontend:dev
# OR
cd frontend && bun dev
```

**Backend Only:**
```bash
bun run dev:backend
# OR
cd backend && uv run fastapi dev main.py
```

## Code Quality & Testing

### Linting
- **Frontend**:
  ```bash
  cd frontend
  bun lint
  ```
- **Backend**:
  Use `ruff` (standard for `uv` projects):
  ```bash
  uv run ruff check backend/
  ```

### Testing
- **Frontend**:
  ```bash
  cd frontend
  bun test
  ```
- **Backend**:
  ```bash
  uv run pytest backend/
  ```
  *(Note: Ensure `pytest` is added to backend dependencies if not already present)*

## Key Technologies
- **Frontend**: TypeScript, Next.js, React, Tailwind CSS, Radix UI, Lucide React.
- **Backend**: Python, FastAPI, Agno, SQLAlchemy, Pydantic.
- **Tools**: Bun, uv.
