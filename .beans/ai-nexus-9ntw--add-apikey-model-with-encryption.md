---
# ai-nexus-9ntw
title: Add ApiKey model with encryption
status: todo
type: task
priority: high
tags:
    - Sprint-A
    - backend
created_at: 2026-02-27T16:09:33Z
updated_at: 2026-02-27T16:09:33Z
parent: ai-nexus-9ygz
---

Add ApiKey table: user_id, provider, encrypted_key, is_active. Unique constraint on (user_id, provider). Fernet encryption.
