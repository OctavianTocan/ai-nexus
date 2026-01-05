# Dockerization Guide for ai-nexus

## 1. Dockerfiles (The Recipes)
- **Backend (Python/uv):** Use Python 3.13-slim. Install `uv` first. Copy `pyproject.toml`/`uv.lock` before code for caching. Expose API port.
- **Frontend (Bun/Next.js):** Use `oven/bun`. Decide between `dev` (live reload) vs `prod` (build/serve). Pass Backend URL via env vars.

## 2. Docker Compose (The Conductor)
- **Networking:** Services use container names as hostnames (e.g., `http://backend:8000`).
- **Volumes:** Mount `./backend` and `./frontend` for local dev synchronization without rebuilds.
- **Persistance:** Map `agno.db` to a named volume to keep data after container restarts.

## 3. Optimization
- **Multi-Stage Builds:** Separate build environment from runtime environment to keep images small.
- **Environment:** Use `.env` files managed by Compose.

## Next Steps
- Define `CMD` for both services.
- Configure `docker-compose.yml` networking.
- Set up volumes for the SQLite database.

