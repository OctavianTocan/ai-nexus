import Chat from "@/components/chat/chat";


/**
 * ConversationPage displays the chat UI for a given conversation.
 * 
 * @param params - Route parameters containing the conversationId.
 * @returns The Chat component with the specified conversation context.
 */
interface ConversationPageProps {
    params: {
        conversationId: string;
    };
};

/**
 * Props for the ConversationPage component.
 *
 * @property params - An object containing route parameters.
 * @property params.conversationId - The unique identifier for the conversation being displayed.
 */
export default function ConversationPage({ params }: ConversationPageProps) {

    // Render the chat component.
    return <div>
        <h1>Conversation {params.conversationId}</h1>
        <Chat conversationId={params.conversationId} />
    </div>;
}