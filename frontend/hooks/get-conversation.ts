import { useAuthedFetch } from "./use-authed-fetch";
import type { Conversation } from "@/lib/types";
import { API_ENDPOINTS } from "@/lib/api";

/*
    Custom hook to get a conversation by ID.
    @param conversationId - The ID of the conversation to get.
    @returns The conversation.
*/
export default function useGetConversation(conversationId: string): Promise<Conversation> {
    // Use the useAuthedFetch hook to fetch the conversation.
    const fetcher = useAuthedFetch();

    // Get a conversation by ID.
    async function getConversation(): Promise<Conversation> {
        const response = await fetcher(API_ENDPOINTS.conversations.get(conversationId), {
            method: "GET",
            headers: {
                "content-type": "application/json",
            }
        });

        // Get the conversation from the response.
        const jsonData = await response.json();
        // Return the conversation.
        return jsonData as Conversation;
    };

    // Return the getConversation function.
    return getConversation();
};