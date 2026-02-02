import { useAuthedFetch } from "./use-authed-fetch";
import { API_ENDPOINTS } from "@/lib/api";

export async function useCreateConversation(): Promise<string> {
    // TODO: This needs to call the backend using useAuthedFetch, create a new conversation using the /api/v1/conversations endpoint, and return the conversation ID.
    // We will use this hook to create new conversations from the frontend; For now, just from the homepage button.

    // TODO: The endpoints should go into a constants file somewhere.
    const fetcher = useAuthedFetch();
    // Create a new conversation.
    const response = await fetcher(API_ENDPOINTS.conversations.create, {
        method: "POST",
    });

    // Get the conversation ID from the response.
    const jsonData = await response.json();
    // Return the conversation ID.
    return jsonData.id as string;
}

/*
#### 7. Create `useCreateConversation` Hook
**File:** `frontend/hooks/use-create-conversation.ts` (new file)
**Action:** Create reusable hook that:
- Calls `POST /api/v1/conversations`
- Extracts the returned conversation ID
- Navigates to `/c/[conversationId]`
- Returns `isCreating`, `error`, and `createAndNavigate` function
**Why Needed:** Allows creating conversations from any component (landing page, sidebar, etc.)
**Estimated Time:** 20 minutes
*/