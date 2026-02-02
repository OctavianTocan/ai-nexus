# AI Nexus - Project TODO / Roadmap

This document outlines the current TODOs for the AI Nexus chat application, prioritized by importance and dependency.

---

## 🎉 COMPLETED TASKS

These tasks have been completed and are no longer needed.

### Backend (Completed)

- ✅ **1.** Fix Duplicate Definitions in `models.py` - DONE (single definition now exists)
- ✅ **2.** Fix `/api/v1/conversations` Endpoint Response - DONE (returns proper conversation ID and timestamps)
- ✅ **Models.py** - Foreign key constraints added (user_id and conversation_id)

### Frontend (Completed)

- ✅ **3.** Create Dynamic Route for Conversations - DONE (`/app/c/[conversationId]/page.tsx`)
- ✅ **4.** Update Chat Component to Accept Conversation ID - DONE
- ✅ **5.** Update `useChat` Hook to Include Conversation ID - DONE
- ✅ **6.** Create `useCreateConversation` Hook - DONE
- ✅ **7.** Update Landing Page - DONE (uses `useCreateConversation` hook)
- ✅ **8.** API Endpoints TypeScript Definitions - DONE (`lib/api.ts`)

---

## 🔴 CRITICAL (Blocking Core Features)

These tasks must be completed to enable the core conversation management functionality.

### Backend Issues

#### 9. Implement `get_conversations_for_user` CRUD Function
**File:** `backend/app/crud/conversation.py` (lines 66-86)
**Status:** Currently commented out
**Action:** Uncomment and implement to retrieve all conversations for a user, ordered by `updated_at DESC`
**Why Needed:** Required for sidebar conversation list
**Estimated Time:** 10 minutes

#### 10. Create GET `/api/v1/conversations` Endpoint
**File:** `backend/main.py` (lines 242-265)
**Status:** Currently commented out
**Action:** Uncomment and implement endpoint to list all conversations for authenticated user
**Estimated Time:** 10 minutes

#### 11. Implement `get_conversation` CRUD Function
**File:** `backend/app/crud/conversation.py` (lines 40-62)
**Status:** Currently commented out
**Action:** Uncomment and implement to retrieve a single conversation by ID, with user ownership check
**Estimated Time:** 10 minutes

#### 12. Create GET `/api/v1/conversations/:id` Endpoint
**File:** `backend/main.py` (lines 206-239)
**Status:** Currently commented out
**Action:** Uncomment and implement endpoint to get a single conversation by ID
**Estimated Time:** 10 minutes

#### 13. Fix Conversation Ownership Verification in `/api/chat`
**File:** `backend/main.py` (line 164)
**Current Issue:** The `/api/chat` endpoint uses `request.conversation_id` but doesn't verify the user owns that conversation
**Action:** Add verification logic to check that conversation belongs to the current user before passing to Agno
**Why Needed:** Security vulnerability - users could access each other's conversations
**Estimated Time:** 15 minutes

### Frontend Issues

#### 14. Create Sidebar Component
**File:** `frontend/components/conversation-sidebar.tsx` (new file)
**Action:** Create component that:
- Calls GET `/api/v1/conversations` to fetch user's conversations
- Displays list of conversations with titles and timestamps
- Clicking a conversation navigates to `/c/[id]`
- Includes "New Conversation" button using `useCreateConversation` hook
**Why Needed:** Core UI for navigating between conversations
**Estimated Time:** 30 minutes

#### 15. Integrate Sidebar into Chat Pages
**File:** `frontend/app/c/[conversationId]/page.tsx`
**Action:** Update the page layout to include the sidebar component
- Left side: Conversation sidebar (list of conversations)
- Right side: Chat component
- Responsive design: Collapsible sidebar on mobile
**Estimated Time:** 20 minutes

---

## 🟠 HIGH PRIORITY (Full CRUD)

Complete these to have a fully functional conversation management system.

### Backend

#### 16. Add `ConversationUpdate` Schema
**File:** `backend/app/schemas.py`
**Action:** Create Pydantic schema for updating conversations:
```python
class ConversationUpdate(BaseModel):
    title: Optional[str] = None
```
**Estimated Time:** 5 minutes

#### 17. Implement `update_conversation` CRUD Function
**File:** `backend/app/crud/conversation.py` (lines 90-119)
**Status:** Currently commented out
**Action:** Uncomment and implement to update conversation metadata
**Estimated Time:** 10 minutes

#### 18. Implement `delete_conversation` CRUD Function
**File:** `backend/app/crud/conversation.py` (lines 123-144)
**Status:** Currently commented out
**Action:** Uncomment and implement to delete a conversation (cascade delete messages)
**Estimated Time:** 10 minutes

#### 19. Create PUT `/api/v1/conversations/:id` Endpoint
**File:** `backend/main.py` (lines 268-296)
**Status:** Currently commented out
**Action:** Uncomment and implement endpoint to update conversation metadata (e.g., rename)
**Estimated Time:** 10 minutes

#### 20. Create DELETE `/api/v1/conversations/:id` Endpoint
**File:** `backend/main.py` (lines 299-320)
**Status:** Currently commented out
**Action:** Uncomment and implement endpoint to delete a conversation
**Note:** Also clear the Agno session for cleanup
**Estimated Time:** 10 minutes

#### 21. Create GET `/api/v1/conversations/:id/messages` Endpoint
**File:** `backend/main.py` (lines 323-350)
**Status:** Currently commented out
**Action:** Uncomment and implement endpoint to fetch all messages for a conversation
**Note:** Messages can come from your DB (faster) or Agno's DB (actual source)
**Estimated Time:** 15 minutes

### Frontend

#### 22. Add Rename Conversation to Sidebar
**File:** `frontend/components/conversation-sidebar.tsx`
**Action:** Add UI to rename conversations:
- Double-click or edit icon on conversation item
- Inline edit or modal dialog
- Calls PUT `/api/v1/conversations/:id` endpoint
**Estimated Time:** 20 minutes

#### 23. Add Delete Conversation to Sidebar
**File:** `frontend/components/conversation-sidebar.tsx`
**Action:** Add UI to delete conversations:
- Delete icon with confirmation dialog
- Calls DELETE `/api/v1/conversations/:id` endpoint
- Refresh conversation list after deletion
**Estimated Time:** 15 minutes

---

## 🟡 MEDIUM PRIORITY (Enhancements)

### Backend

#### 24. Add User Relationships to Models
**File:** `backend/app/models.py` (lines 52-56)
**Status:** Currently commented out
**Action:** Uncomment and enable bi-directional relationships:
- User ↔ Conversation relationship
**Why Needed:** Enables ORM queries like `user.conversations`
**Estimated Time:** 10 minutes

#### 25. Implement Message CRUD Functions
**File:** `backend/app/crud/message.py`
**Status:** Currently commented out
**Action:** Uncomment and implement message operations for backup/mirroring to your database
**Why Needed:** Optional backup/analytics of messages
**Estimated Time:** 30 minutes

#### 26. Update Conversation `updated_at` on New Messages
**File:** `backend/main.py` (in `/api/chat` endpoint)
**Action:** After processing a message, update the conversation's `updated_at` timestamp
**Why Needed:** Keeps conversation list sorted by last activity
**Estimated Time:** 15 minutes

### Frontend

#### 27. Add Loading States
**Files:** Multiple components
**Action:** Add loading spinners/indicators for:
- Loading conversation list in sidebar
- Creating new conversation
- Loading individual conversation
**Estimated Time:** 30 minutes

#### 28. Add Error Handling
**Files:** Multiple components
**Action:** Handle edge cases:
- Conversation doesn't exist (404)
- User doesn't own the conversation (403)
- API failures (network errors)
- Display user-friendly error messages
**Estimated Time:** 30 minutes

#### 29. Implement Conversation Title Generation
**Backend:** Update `/api/chat` to generate title from first message using LLM
**Frontend:** Update conversation title after creation
**Action:** Use Agno agent or separate LLM call to generate meaningful title from first user message
**Estimated Time:** 45 minutes

---

## 🟢 LOW PRIORITY (Polish)

### UI/UX Enhancements

#### 30. Add Conversation Search/Filter
**File:** `frontend/components/conversation-sidebar.tsx`
**Action:** Add search input to filter conversations by title
**Estimated Time:** 20 minutes

#### 31. Add Conversation Timestamp Formatting
**File:** `frontend/components/conversation-sidebar.tsx`
**Action:** Display relative timestamps (e.g., "2 hours ago", "Yesterday")
**Estimated Time:** 10 minutes

#### 32. Add Mobile Sidebar Toggle
**File:** `frontend/app/c/[conversationId]/page.tsx`
**Action:** Add hamburger menu to toggle sidebar on mobile devices
**Estimated Time:** 15 minutes

#### 33. Add Empty State for Conversation List
**File:** `frontend/components/conversation-sidebar.tsx`
**Action:** Show friendly message when no conversations exist
**Estimated Time:** 10 minutes

---

## 📋 Recommended Implementation Order

### First Sprint (Get Basic Navigation Working)
**Goal:** User can see and navigate between conversations

1. Implement `get_conversations_for_user` CRUD (10 min)
2. Create GET `/api/v1/conversations` endpoint (10 min)
3. Create sidebar component (30 min)
4. Integrate sidebar into chat pages (20 min)
5. Add loading states (30 min)

**Total Estimated Time:** ~1.5-2 hours

---

### Second Sprint (Complete Conversation CRUD)
**Goal:** Full conversation management (create, read, update, delete)

1. Implement `get_conversation` CRUD (10 min)
2. Create GET `/api/v1/conversations/:id` endpoint (10 min)
3. Add `ConversationUpdate` schema (5 min)
4. Implement `update_conversation` CRUD (10 min)
5. Implement `delete_conversation` CRUD (10 min)
6. Create PUT `/api/v1/conversations/:id` endpoint (10 min)
7. Create DELETE `/api/v1/conversations/:id` endpoint (10 min)
8. Create GET `/api/v1/conversations/:id/messages` endpoint (15 min)
9. Add rename conversation UI (20 min)
10. Add delete conversation UI (15 min)

**Total Estimated Time:** ~2 hours

---

### Third Sprint (Security & Polish)
**Goal:** Production-ready with error handling and enhancements

1. Fix conversation ownership verification in `/api/chat` (15 min)
2. Add User relationships to models (10 min)
3. Update conversation `updated_at` on new messages (15 min)
4. Add error handling (30 min)
5. Implement conversation title generation (45 min)

**Total Estimated Time:** ~2 hours

---

### Fourth Sprint (UI/UX Polish)
**Goal:** Enhanced user experience

1. Add conversation search/filter (20 min)
2. Add conversation timestamp formatting (10 min)
3. Add mobile sidebar toggle (15 min)
4. Add empty state for conversation list (10 min)

**Total Estimated Time:** ~1 hour

---

## 🚀 Quick Wins (Do These First!)

These tasks provide immediate value and should be tackled first:

| Task | File | Time | Impact |
|------|------|------|--------|
| Implement `get_conversations_for_user` | `backend/app/crud/conversation.py` | 10 min | Enables conversation list |
| Create GET `/api/v1/conversations` | `backend/main.py` | 10 min | API for sidebar |
| Create sidebar component | `frontend/components/conversation-sidebar.tsx` | 30 min | Core UI navigation |

**Total:** ~50 minutes for basic sidebar functionality

---

## 📝 Architecture Notes

### Current Architecture
- **Frontend:** Next.js 16 with App Router (SPA with client-side navigation)
- **Backend:** FastAPI with async SQLAlchemy
- **Database:** SQLite with aiosqlite (agno.db)
- **AI/Chat:** Agno agent with Gemini model
- **Auth:** FastAPI-Users with JWT cookies

### Key Decisions
- **Routing:** Using dynamic routes `/c/[conversationId]` for SPA behavior with shareable URLs
- **State Management:** Conversation ID comes from URL (not local state)
- **API Design:** RESTful with nouns for resources, HTTP methods for actions
- **Storage:** Conversation metadata in your DB, actual messages in Agno's DB

### Known Issues
- **Security:** `/api/chat` doesn't verify conversation ownership (Task 13)
- **Data Consistency:** No automatic `updated_at` updates on new messages (Task 26)

---

## 🛠️ How to Use This Document

1. **Start with Quick Wins** - Do the 50-minute tasks to get sidebar working
2. **Follow Sprint Order** - Complete tasks in order as listed in sprints
3. **Mark as Done** - Move completed tasks to the COMPLETED section
4. **Update Estimates** - Adjust time estimates based on your actual progress
5. **Add New Tasks** - Add any new TODOs that arise during development

---

## 📊 Progress Tracking

### Overall Progress
- **Completed:** 8 tasks
- **In Progress:** 0 tasks
- **Remaining:** 24 tasks
- **Completion:** 25% (8/32)

### By Priority
- **🔴 Critical:** 6/6 tasks remaining (0% complete)
- **🟠 High Priority:** 8/8 tasks remaining (0% complete)
- **🟡 Medium Priority:** 6/6 tasks remaining (0% complete)
- **🟢 Low Priority:** 4/4 tasks remaining (0% complete)

---

Last Updated: 2025-02-02

---

## 🔍 Codebase Analysis Summary

### What's Working
✅ Conversation creation endpoint
✅ Dynamic routing for conversations
✅ Chat component with conversation ID
✅ useCreateConversation hook
✅ Landing page integration
✅ Foreign key constraints in models
✅ TypeScript API definitions

### What's Missing
❌ GET conversations list endpoint
❌ Sidebar component
❌ Conversation CRUD (update, delete)
❌ Ownership verification
❌ Message history endpoint
❌ Error handling
❌ Loading states
