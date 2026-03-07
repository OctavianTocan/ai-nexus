---
# ai-nexus-kgcw
title: Add UserSettings model
status: todo
type: task
priority: high
tags:
    - Sprint-A
    - backend
created_at: 2026-02-27T16:09:33Z
updated_at: 2026-03-07T21:30:03Z
parent: ai-nexus-9ygz
---

Add UserSettings table: theme, accent_color, font_size, chat_width, message_density, default_model, custom_instructions (text, nullable — user's global system prompt, like ChatGPT Custom Instructions). FK to user with CASCADE delete.
