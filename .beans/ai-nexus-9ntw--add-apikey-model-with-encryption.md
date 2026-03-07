---
# ai-nexus-9ntw
title: Add ApiKey model with encryption
status: in-progress
type: task
priority: high
tags:
    - Sprint-A
    - backend
created_at: 2026-02-27T16:09:33Z
updated_at: 2026-03-07T21:47:27Z
parent: ai-nexus-9ygz
---

Add ApiKey table: user_id, provider, encrypted_key, is_active. Unique constraint on (user_id, provider). Use sqlalchemy-utils StringEncryptedType with FernetEngine. Encryption key from FERNET_KEY env var via Pydantic Settings in core/config.py.
