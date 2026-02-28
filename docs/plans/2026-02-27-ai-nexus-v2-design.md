# AI Nexus v2 Design: Premium AI Chatbot Platform

**Date:** 2026-02-27
**Status:** Approved
**Goal:** Transform AI Nexus from a basic AI chat app into a portfolio-grade, polished, feature-rich, configurable AI chatbot platform.

## Vision

AI Nexus becomes the most polished, feature-rich, configurable AI chatbot you can self-host. Not a new product category -- the best version of this category. Three pillars: visual polish, smart AI features, and deep configurability.

## Pillar 1: Visual Polish & UX

### Chat Experience
- Streaming with style: typing indicator with subtle pulse animation, smooth text reveal, auto-scroll with "scroll to bottom" pill
- Rich markdown: syntax-highlighted code blocks (Shiki), LaTeX math rendering, tables, collapsible sections, copy buttons on code
- Message actions: copy, regenerate, edit & resend, fork conversation from this point
- Model badge: each message shows which model generated it

### Layout
- Resizable split pane: sidebar can be collapsed, dragged to resize
- Keyboard-first: `Cmd+K` command palette, `Cmd+N` new chat, `Cmd+/` toggle sidebar, `Cmd+Shift+M` switch model, `Cmd+Enter` send
- Responsive: full mobile support, sidebar becomes bottom sheet on mobile

### Theming
- Dark & light mode with smooth transition animations
- Accent color picker (purple, blue, green, orange, etc.)
- CSS custom properties throughout

### Micro-interactions
- Hover effects on conversation list items
- Glass morphism on panels and cards
- Motion animations on page transitions, message entry, sidebar toggle
- Skeleton loaders while fetching conversations/messages
- Toast notifications for async events

### Empty States
- Beautiful onboarding when no conversations exist
- Suggested prompts / quick actions on empty chat
- Persona cards to pick a conversation style

## Pillar 2: Smart AI Features

### Multi-Model Support
- **Providers:** Google Gemini (existing), Anthropic Claude, OpenAI GPT, optionally local models via Ollama
- **Model switching:** Drop-down in chat input area, switch models mid-conversation
- **Model comparison:** (stretch) Send same prompt to 2 models side-by-side
- **Per-conversation model memory:** Each conversation remembers which model was used

### MCP Tool Integrations (built-in)

| Tool | Description | Visual |
|------|------------|--------|
| Web Search | Search the web, summarize results | Search card with source links |
| Code Execution | Run Python/JS in a sandboxed env | Code block with output panel |
| Image Generation | Generate images via an API | Inline image preview |
| File Analysis | Read uploaded files (PDF, CSV, images) | File preview card with extracted info |
| URL Fetcher | Fetch and summarize a webpage | Link preview card |

### Tool Call UX
- Agent uses a tool -> collapsible "thinking" card appears in chat
- Shows tool name, input, and output
- Expandable for full details, collapsed by default
- Smooth animation on open/close

### Other AI Features
- System prompts: set custom instructions per conversation or globally
- Token counter: live count in the input area (Tokenlens)
- Conversation forking: branch from any message
- Regenerate with different model
- Conversation title auto-generation (already built)

## Pillar 3: Configurability

### Settings Panel (`Cmd+,` or gear icon)

**Model Settings:**
- API key management (encrypted in DB, never exposed to frontend)
- Default model selection
- Available model toggles
- Temperature / max tokens / top-p (advanced, collapsible)

**Tool Settings:**
- MCP tool toggles (enable/disable per tool)
- Custom MCP server URLs (power user)
- Per-tool permissions: "always allow", "ask before using", "disabled"

**Personas / System Prompts:**
- Built-in: "Coding Assistant", "Writing Helper", "Creative Brainstormer", "Researcher"
- Custom personas: name, icon, system prompt, default model
- Per-conversation persona override

**Appearance:**
- Theme: light / dark / system
- Accent color picker
- Font size: small / medium / large
- Chat width: compact / comfortable / wide
- Message density: comfortable / compact

**Data & Privacy:**
- Export conversations (JSON or Markdown)
- Delete all data (with confirmation)
- Clear conversation history (per-conversation or all)

## Architecture

### Frontend (Next.js 16)

```
app/
  (app)/                      # Authenticated routes
    layout.tsx                 # Sidebar + main content
    page.tsx                   # New conversation
    c/[id]/page.tsx            # Conversation view
    settings/                  # Settings pages
      page.tsx                 # General settings
      models/page.tsx          # Model config
      tools/page.tsx           # MCP tool config
      personas/page.tsx        # Persona management
  (auth)/                      # Login/signup
  components/
    chat/                      # Chat UI components
    settings/                  # Settings components
    tools/                     # Tool result cards
    ui/                        # shadcn base components
  hooks/                       # Custom hooks
  lib/                         # Utilities, API client, types
```

### Backend (FastAPI)

```
backend/
  app/
    api/
      chat.py                  # Chat + streaming (SSE)
      conversations.py         # CRUD endpoints
      settings.py              # User settings API
      models.py                # Model provider management
      tools.py                 # MCP tool status/config
    core/
      agents/                  # Agno agent configs per model provider
      mcp/                     # MCP server manager + built-in servers
      providers/               # Model provider adapters (Gemini, Claude, OpenAI)
      security.py              # API key encryption, auth
    models/                    # SQLAlchemy models
    crud/                      # Database operations
    schemas/                   # Pydantic schemas
```

### Key Decisions
- **SSE stays for streaming** -- no WebSocket needed, tool calls are inline with chat stream
- **MCP servers as subprocesses** -- backend spawns them, routes tool calls through Agno
- **Multi-provider via adapter pattern** -- each LLM provider gets an adapter that creates the right Agno agent
- **Settings stored server-side** -- synced on login, settings follow across devices

### New Database Tables
- `user_settings` -- JSON blob per user for preferences
- `api_keys` -- encrypted per-provider API keys
- `personas` -- custom personas (name, system_prompt, model, icon)
- `tool_events` -- log of tool calls within conversations

## Existing Assets to Leverage
- Shiki (syntax highlighting) -- already installed
- Tokenlens (token counting) -- already installed
- Motion.js (animations) -- already installed
- @xyflow/react (graph viz) -- installed, potential future use
- glass-utils.ts & hover-effects.ts -- existing utilities
- MCP dependency -- already in pyproject.toml
- Agno agent framework -- already integrated
- File attachment UI -- built, needs backend wiring

## What This Replaces
The existing 42 Notion/beans tasks are mostly incremental CRUD and cleanup. This design supersedes them with a cohesive vision. Some tasks (like DELETE endpoint, CORS config, health check) remain relevant as prerequisites. Others (like "Add Dark Mode Toggle") are now part of the larger theming system.
