---
# ai-nexus-93fu
title: Update database initialization for new models
status: todo
type: task
priority: high
tags:
    - Sprint-A
    - backend
created_at: 2026-02-27T16:09:34Z
updated_at: 2026-03-07T21:46:35Z
parent: ai-nexus-9ygz
---

Ensure UserSettings and ApiKey models are imported in create_db_and_tables so SQLAlchemy creates all tables on startup. Also add model field to existing Conversation model.
