import Chat from "@/components/chat/chat";


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
    // Get the conversation ID from the params.
    const { conversationId } = await params;
    // Render the chat component.
    return <div>
        <h1>Conversation {conversationId}</h1>
        <Chat conversationId={conversationId} />
    </div>;
}