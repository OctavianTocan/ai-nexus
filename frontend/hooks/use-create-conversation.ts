import { useMutation } from "@tanstack/react-query";
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

    return useMutation({
        mutationKey: ['conversations'],
        mutationFn: async () => {
            const response = await fetcher(API_ENDPOINTS.conversations.create, {
                method: "POST",
                body: JSON.stringify({}),
                headers: {
                    "content-type": "application/json",
                }
            });
            return response.json();
        }
    });
}