import Chat from "@/components/chat/chat";
import { useParams } from "next/navigation";

export default function ConversationPage() {
    // Grab the params from the URL.
    const params = useParams();
    // Get the conversation ID from the params.
    const conversationId = params.conversationId as string;

    return <Chat />;
}