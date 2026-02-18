import ChatContainer from "@/features/chat/ChatContainer";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api";
import { cookies } from "next/headers";
import { notFound, unauthorized } from "next/navigation";

/**
 * ConversationPage displays the chat UI for a given conversation.
 *
 * @param params - Route parameters containing the conversationId.
 * @returns The Chat component with the specified conversation context.
 */
interface ConversationPageProps {
    params: Promise<{ conversationId: string }>;
}

// TODO: Needs to be moved to a shared type file.
/**
 * Message shape used by the Agno agent / chat API.
 * @property role - Sender of the message: user or assistant.
 * @property content - Plain-text message body.
 */
export interface AgnoMessage {
    role: "user" | "assistant";
    content: string;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
    //TODO: We need to make sure that we're not trying to fetch messages when we've just created a conversation.
    // TODO: All of this needs some cleanup and error handling.
    // Get the conversation ID from the params.
    const { conversationId } = await params;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token");

    // TODO: Need a server-side utility function to do authed fetching.
    // We just try to get the messages, because the conversation auth is handled either way.
    const response = await fetch(API_BASE_URL + API_ENDPOINTS.conversations.getMessages(conversationId), {
        method: "GET",
        headers: {
            "content-type": "application/json",
            // We use Cookie Transport for authentication, so we need to include the session token in the cookies.
            Cookie: `session_token=${sessionToken?.value}`,
        },
    });

    // NOTE: This here uses Next.js experimental authInterrupts feature.
    if (response.status === 401) {
        unauthorized();
    }
    // If the conversation is not found, we should show a 404 page.
    if (response.status === 404) {
        notFound();
    }

    const messages = await response.json();

    // Render the chat component.
    return (
        <div>
            <h1 className="flex-1 items-center text-center">Conversation {conversationId}</h1>
            <ChatContainer/>
        </div>
    );
}
