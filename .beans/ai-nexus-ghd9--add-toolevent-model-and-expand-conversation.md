---
# ai-nexus-ghd9
title: Add model field to Conversation
status: todo
type: task
priority: high
tags:
    - Sprint-A
    - backend
created_at: 2026-02-27T16:09:34Z
updated_at: 2026-03-07T21:46:32Z
parent: ai-nexus-9ygz
---

Add model field (String, nullable) to Conversation table to track which LLM was used.

ToolEvent table was scrapped — Agno already persists tool calls natively via `store_tool_messages` (default: True).
