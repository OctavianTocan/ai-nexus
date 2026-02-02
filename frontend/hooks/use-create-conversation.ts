import { useAuthedFetch } from "./use-authed-fetch";
import { API_ENDPOINTS } from "@/lib/api";

/**
 * useCreateConversation is a hook that creates a new conversation.
 * 
 * @returns A function that creates a new conversation.
 * @returns The conversation ID.
 */
export function useCreateConversation() {
    const fetcher = useAuthedFetch();

    // Create a new conversation.
    async function createConversation(): Promise<string> {
        // Send a POST request to the /api/v1/conversations endpoint to create a new conversation.
        const response = await fetcher(API_ENDPOINTS.conversations.create, {
            method: "POST",
            body: JSON.stringify({}),
            headers: {
                "content-type": "application/json",
            }
        });

        // Get the conversation ID from the response.
        const jsonData = await response.json();
        // Return the conversation ID.
        return jsonData.id as string;
    };

    // Return the createConversation function.
    return createConversation;
}

// TODO
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