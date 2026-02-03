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

### Authentication & User Experience

#### 9. Add Error State to Login Form

**File:** `frontend/components/login-form.tsx`
**Current Issue:** Login failures throw errors but don't display them to users
**Action:** Add error state and display user-friendly error messages in the UI
**Why Needed:** Users have no feedback when login fails

#### 10. Add Success/Error Feedback to Signup Form

**File:** `frontend/components/signup-form.tsx`
**Current Issue:** After clicking "Create Account", users get no feedback on success or failure
**Action:**

- Display error messages when registration fails (e.g., "User already exists")
- Show success message or redirect on successful registration

#### 11. Auto-Login After Registration

**File:** `frontend/components/signup-form.tsx`, `backend/main.py`
**Current Issue:** Users must manually sign in after registering, which feels awkward
**Action:** Automatically log users in immediately after successful registration
**Why Needed:** Better UX - users shouldn't have to enter credentials twice

### Backend Issues

#### 12. Fix Duplicate Code in `main.py`

**File:** `backend/main.py` (lines 352-374)
**Current Issue:** The `event_stream` function and return statement are duplicated
**Action:** Remove the duplicate code block
**Why Needed:** Code cleanliness and potential bugs

#### 13. Fix Conversation Ownership Verification in `/api/chat`

**File:** `backend/main.py` (line 164)
**Current Issue:** The `/api/chat` endpoint uses `request.conversation_id` but doesn't verify the user owns that conversation
**Action:** Add verification logic to check that conversation belongs to the current user before passing to Agno
**Why Needed:** Security vulnerability - users could access each other's conversations

#### 14. Implement `get_conversations_for_user` CRUD Function

**File:** `backend/app/crud/conversation.py` (lines 66-86)
**Status:** Currently commented out
**Action:** Uncomment and implement to retrieve all conversations for a user, ordered by `updated_at DESC`
**Why Needed:** Required for sidebar conversation list

#### 15. Create GET `/api/v1/conversations` Endpoint

**File:** `backend/main.py` (lines 242-265)
**Status:** Currently commented out
**Action:** Uncomment and implement endpoint to list all conversations for authenticated user

#### 16. Implement `get_conversation` CRUD Function

**File:** `backend/app/crud/conversation.py` (lines 40-62)
**Status:** Currently commented out
**Action:** Uncomment and implement to retrieve a single conversation by ID, with user ownership check

#### 17. Create GET `/api/v1/conversations/:id` Endpoint

**File:** `backend/main.py` (lines 206-239)
**Status:** Currently commented out
**Action:** Uncomment and implement endpoint to get a single conversation by ID

### Frontend Issues

#### 18. Create Conversation List/Sidebar for Home Page

**File:** `frontend/app/page.tsx`, `frontend/components/conversation-sidebar.tsx` (new file)
**Current Issue:** Landing page is minimal with just a single button; no way to see past conversations
**Action:** Create component that:

- Calls GET `/api/v1/conversations` to fetch user's conversations
- Displays list of conversations with titles and timestamps
- Clicking a conversation navigates to `/c/[id]`
- Includes "New Conversation" button using `useCreateConversation` hook
  **Why Needed:** Core UI for navigating between conversations

#### 19. Widen Chat Layout

**File:** `frontend/components/chat/chat.tsx` (line 110)
**Current Issue:** Chat uses `w-[30%]` which is too narrow on most screens
**Action:** Use responsive classes like `w-full max-w-3xl md:w-[70%] lg:w-[60%]`
**Why Needed:** Better readability and use of screen space

#### 20. Integrate Sidebar into Chat Pages

**File:** `frontend/app/c/[conversationId]/page.tsx`
**Action:** Update the page layout to include the sidebar component

- Left side: Conversation sidebar (list of conversations)
- Right side: Chat component
- Responsive design: Collapsible sidebar on mobile

---

## 🟠 HIGH PRIORITY (Full CRUD & Core UX)

Complete these to have a fully functional conversation management system.

### Backend

#### 21. Add `ConversationUpdate` Schema

**File:** `backend/app/schemas.py`
**Action:** Create Pydantic schema for updating conversations:

```python
class ConversationUpdate(BaseModel):
    title: Optional[str] = None
```

#### 22. Implement `update_conversation` CRUD Function

**File:** `backend/app/crud/conversation.py` (lines 90-119)
**Status:** Currently commented out
**Action:** Uncomment and implement to update conversation metadata

#### 23. Implement `delete_conversation` CRUD Function

**File:** `backend/app/crud/conversation.py` (lines 123-144)
**Status:** Currently commented out
**Action:** Uncomment and implement to delete a conversation (cascade delete messages)

#### 24. Create PUT `/api/v1/conversations/:id` Endpoint

**File:** `backend/main.py` (lines 268-296)
**Status:** Currently commented out
**Action:** Uncomment and implement endpoint to update conversation metadata (e.g., rename)

#### 25. Create DELETE `/api/v1/conversations/:id` Endpoint

**File:** `backend/main.py` (lines 299-320)
**Status:** Currently commented out
**Action:** Uncomment and implement endpoint to delete a conversation
**Note:** Also clear the Agno session for cleanup

#### 26. Create GET `/api/v1/conversations/:id/messages` Endpoint

**File:** `backend/main.py` (lines 323-350)
**Status:** Currently commented out
**Action:** Uncomment and implement endpoint to fetch all messages for a conversation
**Note:** Messages can come from your DB (faster) or Agno's DB (actual source)

#### 27. Add Logout Endpoint

**File:** `backend/main.py`
**Current Issue:** FastAPI-Users provides logout but it's not included in the router
**Action:** Add `fastapi_users.get_logout_router(auth_backend)` to exposed routes

### Frontend

#### 28. Load Message History on Page Refresh

**File:** `frontend/components/chat/chat.tsx`
**Current Issue:** Chat history is only stored in React state and lost on page refresh (TODO at line 41)
**Action:** Fetch existing messages from backend on component mount using the `conversationId`
**Why Needed:** Users lose their conversation when refreshing the page

#### 29. Add Rename Conversation to Sidebar

**File:** `frontend/components/conversation-sidebar.tsx`
**Action:** Add UI to rename conversations:

- Double-click or edit icon on conversation item
- Inline edit or modal dialog
- Calls PUT `/api/v1/conversations/:id` endpoint

#### 30. Add Delete Conversation to Sidebar

**File:** `frontend/components/conversation-sidebar.tsx`
**Action:** Add UI to delete conversations:

- Delete icon with confirmation dialog
- Calls DELETE `/api/v1/conversations/:id` endpoint
- Refresh conversation list after deletion

#### 31. Add Loading States to Forms

**Files:** `frontend/components/login-form.tsx`, `frontend/components/signup-form.tsx`
**Current Issue:** No visual feedback while login/signup requests are processing
**Action:** Add `isLoading` state and disable button/show spinner during API calls

---

## 🟡 MEDIUM PRIORITY (Enhancements)

### Backend

#### 32. Add User Relationships to Models

**File:** `backend/app/models.py` (lines 52-56)
**Status:** Currently commented out
**Action:** Uncomment and enable bi-directional relationships:

- User ↔ Conversation relationship
  **Why Needed:** Enables ORM queries like `user.conversations`

#### 33. Implement Message CRUD Functions

**File:** `backend/app/crud/message.py`
**Status:** Currently commented out
**Action:** Uncomment and implement message operations for backup/mirroring to your database
**Why Needed:** Optional backup/analytics of messages

#### 34. Update Conversation `updated_at` on New Messages

**File:** `backend/main.py` (in `/api/chat` endpoint)
**Action:** After processing a message, update the conversation's `updated_at` timestamp
**Why Needed:** Keeps conversation list sorted by last activity

#### 35. Add Cascade Delete Configuration

**File:** `backend/app/models.py`
**Current Issue:** Deleting a conversation won't automatically delete its messages
**Action:** Add `cascade="all, delete-orphan"` to the messages relationship

#### 36. Fix Datetime Usage

**File:** `backend/app/crud/conversation.py` (lines 30-31)
**Current Issue:** Uses `datetime.now()` (local time) instead of UTC
**Action:** Use `datetime.utcnow()` or `datetime.now(timezone.utc)` for consistency

#### 37. Add Rate Limiting

**File:** `backend/main.py`
**Current Issue:** The chat endpoint has no rate limiting, allowing potential abuse
**Action:** Add rate limiting middleware (e.g., `slowapi`)

#### 38. Make CORS Origins Configurable

**File:** `backend/main.py` (line 56)
**Current Issue:** CORS allows only `localhost:3001`, breaking production deployments
**Action:** Use environment variable for allowed origins

#### 39. Add Input Validation on Chat Message Length

**File:** `backend/main.py`, `backend/app/schemas.py`
**Current Issue:** Users can send arbitrarily long messages
**Action:** Add `max_length` constraint to `ChatRequest.question`

### Frontend

#### 40. Add Error Handling for Streaming Failures

**Files:** `frontend/components/chat/chat.tsx`, `frontend/hooks/use-chat.ts`
**Current Issue:** If the stream fails mid-response, there's no error UI or retry mechanism
**Action:** Add try-catch around the streaming loop and display error state with retry button

#### 41. Fix React Key Warning

**File:** `frontend/components/chat/chat.tsx` (line 124)
**Current Issue:** Using array index as React key can cause rendering issues
**Action:** Generate unique IDs for each message (e.g., using `nanoid`)

#### 42. Remove Console.log Statements

**File:** `frontend/components/chat/chat.tsx` (lines 78, 104)
**Current Issue:** Debug statements in production code
**Action:** Remove or replace with proper logging utility

#### 43. Implement Conversation Title Generation

**Backend:** Update `/api/chat` to generate title from first message using LLM
**Frontend:** Update conversation title after creation
**Action:** Use Agno agent or separate LLM call to generate meaningful title from first user message

#### 44. Add Global Error Boundary

**File:** `frontend/app/layout.tsx` or new `error-boundary.tsx`
**Current Issue:** Unhandled errors crash the entire app
**Action:** Add React Error Boundary component with fallback UI

---

## 🟢 LOW PRIORITY (Polish & Testing)

### Testing

#### 45. Set Up Agno Session Memory Tests

**File:** `backend/tests/` (new)
**Current Issue:** No tests to verify Agno sessions maintain proper memory across messages
**Action:** Create tests that:

- Send multiple messages in a conversation
- Verify the agent remembers context from previous messages
- Test session persistence across API calls

#### 46. Add Backend Tests

**File:** `backend/tests/`
**Current Issue:** No tests exist
**Action:** Add tests for:

- Auth endpoints (login, register, logout)
- Conversation CRUD operations
- Chat streaming endpoint
- Ownership verification

#### 47. Add Frontend Tests

**Files:** Frontend test files
**Current Issue:** No tests exist
**Action:** Add tests for:

- Component rendering
- Hooks behavior
- Form validation

### UI/UX Enhancements

#### 48. Improve Home Page Design

**File:** `frontend/app/page.tsx`
**Current Issue:** Landing page has a single unstyled button with no visual design
**Action:**

- Add proper styling using existing UI components
- Include a hero section, app description, and call-to-action
- Show recent conversations for logged-in users

#### 49. Update App Metadata

**File:** `frontend/app/layout.tsx`
**Current Issue:** Title is "Create Next App" and description is boilerplate
**Action:** Update to "AI Nexus" with proper description

#### 50. Add Conversation Search/Filter

**File:** `frontend/components/conversation-sidebar.tsx`
**Action:** Add search input to filter conversations by title

#### 51. Add Conversation Timestamp Formatting

**File:** `frontend/components/conversation-sidebar.tsx`
**Action:** Display relative timestamps (e.g., "2 hours ago", "Yesterday")

#### 52. Add Mobile Sidebar Toggle

**File:** `frontend/app/c/[conversationId]/page.tsx`
**Action:** Add hamburger menu to toggle sidebar on mobile devices

#### 53. Add Empty State for Conversation List

**File:** `frontend/components/conversation-sidebar.tsx`
**Action:** Show friendly message when no conversations exist

#### 54. Improve Empty Chat State

**File:** `frontend/components/chat/chat.tsx`
**Current Issue:** The "What can we build together?" message is basic
**Action:** Add suggested prompts, recent topics, or onboarding tips

#### 55. Add Typing Indicator Animation

**File:** `frontend/components/chat/chat.tsx`
**Current Issue:** "Thinking..." text is basic
**Action:** Use animated dots or skeleton loader for better visual feedback

#### 56. Add Dark Mode Toggle

**File:** `frontend/app/layout.tsx` or new theme component
**Current Issue:** Dark mode CSS exists but no way to switch
**Action:** Add theme toggle component

### Cleanup & Configuration

#### 57. Remove Non-Functional UI Elements

**File:** `frontend/components/login-form.tsx`
**Current Issue:** "Forgot password" link (line 88-91) and "Login with Google" button (line 109-111) do nothing
**Action:** Either implement these features or remove the placeholder elements

#### 58. Handle "Full Name" Field in Signup

**File:** `frontend/components/signup-form.tsx`
**Current Issue:** The name field is collected but not sent to the backend
**Action:** Either send to backend and store, or remove the field

#### 59. Add Password Strength Validation

**File:** `frontend/components/signup-form.tsx`
**Current Issue:** Description says "Must be at least 8 characters" but there's no validation
**Action:** Add client-side password validation before submission

#### 60. Create `.env.example` Files

**Files:** `backend/.env.example`, `frontend/.env.example` (new)
**Current Issue:** New developers don't know what environment variables are needed
**Action:** Create example files documenting required env vars

#### 61. Extend Session Lifetime

**File:** `backend/app/users.py` (line 85)
**Current Issue:** `cookie_max_age=3600` (1 hour) is short for a chat app
**Action:** Increase to 7 days (604800 seconds) or implement refresh tokens

### Accessibility

#### 62. Add Skip-to-Content Link

**File:** `frontend/app/layout.tsx`
**Current Issue:** Keyboard users can't skip navigation
**Action:** Add skip link at the top of the page

#### 63. Add Focus Management After Navigation

**Files:** `frontend/app/page.tsx`, `frontend/components/chat/chat.tsx`
**Current Issue:** After creating a conversation, focus isn't moved to the chat input
**Action:** Use `useRef` and `focus()` after navigation

#### 64. Add ARIA Live Regions for Streaming

**File:** `frontend/components/chat/chat.tsx`
**Current Issue:** Screen readers won't announce new message content
**Action:** Add `aria-live="polite"` to message container

---

## 📋 Recommended Implementation Order

### First Sprint (Authentication & Basic Navigation)

**Goal:** Users can register, login seamlessly, and see their conversations

1. Add error state to login form (Task 9)
2. Add success/error feedback to signup form (Task 10)
3. Auto-login after registration (Task 11)
4. Fix duplicate code in main.py (Task 12)
5. Implement `get_conversations_for_user` CRUD (Task 14)
6. Create GET `/api/v1/conversations` endpoint (Task 15)
7. Create conversation list/sidebar (Task 18)
8. Widen chat layout (Task 19)

---

### Second Sprint (Security & Message History)

**Goal:** Secure conversations and persistent chat history

1. Fix conversation ownership verification (Task 13)
2. Implement `get_conversation` CRUD (Task 16)
3. Create GET `/api/v1/conversations/:id` endpoint (Task 17)
4. Create GET `/api/v1/conversations/:id/messages` endpoint (Task 26)
5. Load message history on page refresh (Task 28)
6. Integrate sidebar into chat pages (Task 20)

---

### Third Sprint (Complete Conversation CRUD)

**Goal:** Full conversation management (create, read, update, delete)

1. Add `ConversationUpdate` schema (Task 21)
2. Implement `update_conversation` CRUD (Task 22)
3. Implement `delete_conversation` CRUD (Task 23)
4. Create PUT `/api/v1/conversations/:id` endpoint (Task 24)
5. Create DELETE `/api/v1/conversations/:id` endpoint (Task 25)
6. Add logout endpoint (Task 27)
7. Add rename conversation UI (Task 29)
8. Add delete conversation UI (Task 30)
9. Add loading states to forms (Task 31)

---

### Fourth Sprint (Polish & Testing)

**Goal:** Production-ready with error handling and tests

1. Add User relationships to models (Task 32)
2. Update conversation `updated_at` on new messages (Task 34)
3. Add cascade delete configuration (Task 35)
4. Add error handling for streaming failures (Task 40)
5. Implement conversation title generation (Task 43)
6. Set up Agno session memory tests (Task 45)
7. Add backend tests (Task 46)

---

### Fifth Sprint (UI/UX Polish)

**Goal:** Enhanced user experience

1. Improve home page design (Task 48)
2. Update app metadata (Task 49)
3. Add conversation search/filter (Task 50)
4. Add conversation timestamp formatting (Task 51)
5. Add mobile sidebar toggle (Task 52)
6. Add empty states (Tasks 53, 54)
7. Add typing indicator animation (Task 55)

---

## 📊 Progress Tracking

### Overall Progress

- **Completed:** 8 tasks
- **In Progress:** 0 tasks
- **Remaining:** 56 tasks
- **Completion:** 12.5% (8/64)

### By Priority

- **🔴 Critical:** 0/12 tasks complete (0%)
- **🟠 High Priority:** 0/11 tasks complete (0%)
- **🟡 Medium Priority:** 0/13 tasks complete (0%)
- **🟢 Low Priority:** 0/20 tasks complete (0%)

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
- **Data Consistency:** No automatic `updated_at` updates on new messages (Task 34)
- **Code Quality:** Duplicate code block in main.py (Task 12)

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

❌ Error handling in auth forms
❌ Auto-login after registration
❌ GET conversations list endpoint
❌ Sidebar component
❌ Message history persistence
❌ Conversation CRUD (update, delete)
❌ Ownership verification
❌ Loading states
❌ Tests

---

Last Updated: 2026-02-03
