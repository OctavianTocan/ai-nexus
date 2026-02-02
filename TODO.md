# AI Nexus - Project TODO / Roadmap

This document outlines the current TODOs for the AI Nexus chat application, prioritized by importance and dependency.

---

## 🔴 CRITICAL (Blocking Core Feature)

These tasks must be completed to enable the core conversation management functionality.

### Backend Issues

<!-- #### 1. Fix Duplicate Definitions in `models.py` -->
<!-- **File:** `backend/app/models.py` -->
<!-- **Issue:** `SenderType`, `Conversation`, and `Message` are defined twice (lines 19-31 and 86-119) -->
<!-- **Action:** Delete the duplicate definitions -->
<!-- **Estimated Time:** 5 minutes -->

<!-- #### 2. Fix `/api/v1/conversations` Endpoint Response -->
<!-- **File:** `backend/main.py` (lines 82-106)
**Current Bug:**
- Returns `id=user.id` instead of the actual conversation ID
- Missing `created_at` and `updated_at` fields in response
**Solution:** The `create_conversation_service` function returns a proper `Conversation` object. Use it to construct the `ConversationResponse` correctly.
**Estimated Time:** 10 minutes -->

<!-- TODO: We can do this later. -->
#### 3. Implement `get_conversations_for_user` CRUD Function
**File:** `backend/app/crud/conversation.py` (lines 62-82)
**Status:** Currently commented out
**Action:** Uncomment and implement to retrieve all conversations for a user, ordered by `updated_at DESC`
**Why Needed:** Required for sidebar conversation list
**Estimated Time:** 15 minutes

### Frontend Issues

<!-- #### 4. Create Dynamic Route for Conversations
**File:** `frontend/app/c/[conversationId]/page.tsx` (new file)
**Action:** Create a new page component that:
- Uses `useParams()` to get `conversationId` from URL
- Renders the Chat component with the conversation ID
**Estimated Time:** 20 minutes -->

<!-- #### 5. Update Chat Component to Accept Conversation ID
**File:** `frontend/components/chat/chat.tsx`
**Action:**
- Accept `conversationId` as a prop
- Pass it to the `useChat` hook
- Remove hardcoded conversation logic
**Estimated Time:** 15 minutes -->

<!-- #### 6. Update `useChat` Hook to Include Conversation ID
**File:** `frontend/hooks/use-chat.ts`
**Current Issue:** Only sends `question` to `/api/chat`
**Action:** Update to send `{ question, conversation_id }` in request body
**Estimated Time:** 10 minutes -->

#### 7. Create `useCreateConversation` Hook
**File:** `frontend/hooks/use-create-conversation.ts` (new file)
**Action:** Create reusable hook that:
- Calls `POST /api/v1/conversations`
- Extracts the returned conversation ID
- Navigates to `/c/[conversationId]`
- Returns `isCreating`, `error`, and `createAndNavigate` function
**Why Needed:** Allows creating conversations from any component (landing page, sidebar, etc.)
**Estimated Time:** 20 minutes

---

## 🟠 HIGH PRIORITY (Core Features)

Complete these to have a fully functional conversation management system.

### Backend

#### 8. Implement `get_conversation` CRUD Function
**File:** `backend/app/crud/conversation.py` (lines 36-58)
**Status:** Currently commented out
**Action:** Uncomment and implement to retrieve a single conversation by ID, with user ownership check
**Estimated Time:** 10 minutes

#### 9. Create GET `/api/v1/conversations` Endpoint
**File:** `backend/main.py` (template lines 242-264)
**Action:** Uncomment and implement endpoint to list all conversations for authenticated user
**Estimated Time:** 15 minutes

#### 10. Create GET `/api/v1/conversations/:id` Endpoint
**File:** `backend/main.py` (template lines 205-238)
**Action:** Uncomment and implement endpoint to get a single conversation by ID
**Estimated Time:** 15 minutes

### Frontend

#### 11. Create Sidebar Component
**File:** `frontend/components/conversation-sidebar.tsx` (new file)
**Action:** Create component that:
- Calls GET `/api/v1/conversations` to fetch user's conversations
- Displays list of conversations
- Clicking a conversation navigates to `/c/[id]`
- Includes "New Conversation" button using `useCreateConversation` hook
**Estimated Time:** 30 minutes

#### 12. Update Landing Page
**File:** `frontend/app/page.tsx`
**Action:** Add "Start Chatting" button that uses `useCreateConversation` hook to create conversation and navigate
**Estimated Time:** 15 minutes

---

## 🟡 MEDIUM PRIORITY (Full CRUD)

Implement full Create, Read, Update, Delete (CRUD) operations for conversations.

### Backend

#### 13. Add `ConversationUpdate` Schema
**File:** `backend/app/schemas.py`
**Action:** Create Pydantic schema for updating conversations:
```python
class ConversationUpdate(BaseModel):
    title: Optional[str] = None
```
**Estimated Time:** 5 minutes

#### 14. Implement `update_conversation` CRUD Function
**File:** `backend/app/crud/conversation.py` (lines 86-115)
**Status:** Currently commented out
**Action:** Uncomment and implement to update conversation metadata
**Estimated Time:** 15 minutes

#### 15. Implement `delete_conversation` CRUD Function
**File:** `backend/app/crud/conversation.py` (lines 119-140)
**Status:** Currently commented out
**Action:** Uncomment and implement to delete a conversation (cascade delete messages)
**Estimated Time:** 15 minutes

#### 16. Create PUT `/api/v1/conversations/:id` Endpoint
**File:** `backend/main.py` (template lines 267-295)
**Action:** Uncomment and implement endpoint to update conversation metadata (e.g., rename)
**Estimated Time:** 15 minutes

#### 17. Create DELETE `/api/v1/conversations/:id` Endpoint
**File:** `backend/main.py` (template lines 298-319)
**Action:** Uncomment and implement endpoint to delete a conversation
**Note:** Also clear the Agno session for cleanup
**Estimated Time:** 15 minutes

#### 18. Create GET `/api/v1/conversations/:id/messages` Endpoint
**File:** `backend/main.py` (template lines 322-349)
**Action:** Uncomment and implement endpoint to fetch all messages for a conversation
**Note:** Messages can come from your DB (faster) or Agno's DB (actual source)
**Estimated Time:** 20 minutes

---

## 🟢 LOW PRIORITY (Enhancements)

Polish and complete the feature set.

### Backend

#### 19. Add Foreign Key Constraints to Models
**File:** `backend/app/models.py` (lines 49-50, 52-53, 55-56)
**Status:** Currently commented out
**Action:** Uncomment foreign key relationships for data integrity:
- User ↔ Conversation relationship
- Conversation ↔ Message relationship
**Estimated Time:** 10 minutes

#### 20. Implement Message CRUD Functions
**File:** `backend/app/crud/message.py`
**Status:** Currently commented out
**Action:** Uncomment and implement message operations for backup/mirroring to your database
**Estimated Time:** 30 minutes

#### 21. Update Conversation `updated_at` on New Messages
**File:** `backend/main.py` (in `/api/chat` endpoint)
**Action:** After processing a message, update the conversation's `updated_at` timestamp
**Why Needed:** Keeps conversation list sorted by last activity
**Estimated Time:** 10 minutes

### Frontend

#### 22. Add Loading States
**Files:** Multiple components
**Action:** Add loading spinners/indicators for:
- Creating new conversation
- Loading conversation list
- Loading conversation messages
**Estimated Time:** 30 minutes

#### 23. Add Error Handling
**Files:** Multiple components
**Action:** Handle edge cases:
- Conversation doesn't exist
- User doesn't own the conversation
- API failures
**Estimated Time:** 30 minutes

#### 24. Implement Conversation Title Generation
**Backend:** Update `/api/chat` to generate title from first message using LLM
**Frontend:** Update conversation title after creation
**Action:** Use Agno agent or separate LLM call to generate meaningful title from first user message
**Estimated Time:** 45 minutes

---

## Recommended Starting Order

### First Sprint (Get Conversations Working)
**Goal:** User can create and view conversations

1. Fix `models.py` duplicate definitions (5 min)
2. Fix `/api/v1/conversations` response bug (10 min)
3. Implement `get_conversations_for_user` CRUD (15 min)
4. Create GET `/api/v1/conversations` endpoint (15 min)
5. Create `useCreateConversation` hook (20 min)
6. Update landing page to use hook (15 min)
7. Create `/c/[conversationId]/page.tsx` route (20 min)
8. Update Chat component to accept conversationId (15 min)
9. Update useChat to pass conversation_id (10 min)

**Total Estimated Time:** ~2.5 hours

---

### Second Sprint (Sidebar and Navigation)
**Goal:** User can switch between conversations and see a sidebar

10. Create sidebar component (30 min)
11. Implement `get_conversation` CRUD (10 min)
12. Create GET `/api/v1/conversations/:id` endpoint (15 min)

**Total Estimated Time:** ~1 hour

---

### Third Sprint (Full CRUD)
**Goal:** User can rename and delete conversations

13. Add `ConversationUpdate` schema (5 min)
14. Implement `update_conversation` CRUD (15 min)
15. Implement `delete_conversation` CRUD (15 min)
16. Create PUT `/api/v1/conversations/:id` endpoint (15 min)
17. Create DELETE `/api/v1/conversations/:id` endpoint (15 min)

**Total Estimated Time:** ~1 hour

---

### Fourth Sprint (Enhancements)
**Goal:** Polish user experience

18-24. Implement remaining enhancements (add foreign keys, message CRUD, loading states, error handling, title generation)

**Total Estimated Time:** ~2.5 hours

---

## Quick Wins (Do These First!)

These tasks are quick and provide immediate value:

| Task | File | Time | Impact |
|------|------|------|--------|
| Fix duplicate definitions | `backend/app/models.py` | 5 min | Fixes code errors |
| Fix response bug | `backend/main.py` | 10 min | Fixes broken endpoint |
| Create hook | `frontend/hooks/use-create-conversation.ts` | 20 min | Enables conversation creation |

**Total:** ~35 minutes

---

## Notes

### Architecture Summary
- **Frontend:** Next.js 16 with App Router (SPA with client-side navigation)
- **Backend:** FastAPI with async SQLAlchemy
- **Database:** SQLite with aiosqlite
- **AI/Chat:** Agno agent with Gemini model
- **Auth:** FastAPI-Users with JWT

### Key Decisions Made
- **Routing:** Using dynamic routes `/c/[conversationId]` for SPA behavior with shareable URLs
- **State Management:** Conversation ID comes from URL (not local state)
- **API Design:** RESTful with nouns for resources, HTTP methods for actions
- **Storage:** Conversation metadata in your DB, actual messages in Agno's DB

### Dependencies
- FastAPI-Users must be installed: `uv add fastapi-users`
- Agno dependencies must be configured
- Environment variables: `AUTH_SECRET` for JWT signing

---

## How to Use This Document

1. **Start with Quick Wins** - Do the 35-minute tasks to clear blockers
2. **Follow Sprint Order** - Complete tasks in order as listed in sprints
3. **Mark as Done** - Check off items as you complete them
4. **Update Estimates** - Adjust time estimates based on your actual progress
5. **Add New Tasks** - Add any new TODOs that arise during development

---

Last Updated: 2025-02-02
