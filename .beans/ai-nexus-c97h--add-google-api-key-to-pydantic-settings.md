---
# ai-nexus-c97h
title: Add GOOGLE_API_KEY to pydantic Settings
status: todo
type: bug
priority: high
created_at: 2026-03-04T23:40:08Z
updated_at: 2026-03-04T23:40:08Z
parent: ai-nexus-pva0
---

GOOGLE_API_KEY is not being loaded from .env because it's not declared in app/core/config.py Settings class. The pydantic-settings model uses extra='ignore', so any env var not explicitly listed gets silently dropped. Add google_api_key: str field to Settings so it gets picked up and can be passed to Gemini agents.
