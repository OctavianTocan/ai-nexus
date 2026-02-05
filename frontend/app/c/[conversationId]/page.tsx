import Chat from "@/components/chat/chat";
import getConversation from "@/hooks/get-conversation";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api";
import type { Conversation } from "@/lib/types";
import { cookies } from "next/headers";

/**
 * ConversationPage displays the chat UI for a given conversation.
 * 
 * @param params - Route parameters containing the conversationId.
 * @returns The Chat component with the specified conversation context.
 */
interface ConversationPageProps {
    params: Promise<{ conversationId: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {


    // TODO: All of this needs some cleanup and error handling.
    // Get the conversation ID from the params.
    const { conversationId } = await params;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token');

    const response = await fetch(API_BASE_URL + API_ENDPOINTS.conversations.get(conversationId), {
        method: "GET",
        "headers": {
            "content-type": "application/json",
            "Authorization": `Bearer ${sessionToken?.value}`
        }
    });
    console.log("response", response);
    const jsonResponse = await response.json();
    console.log("jsonResponse", jsonResponse);
    const conversation = jsonResponse as Conversation;
    console.log("conversation", conversation);

    // Render the chat component.
    return <div>
        <h1 className="w-[50%] mx-auto">Conversation {conversationId}</h1>
        <Chat conversationId={conversationId} />
    </div>;
}