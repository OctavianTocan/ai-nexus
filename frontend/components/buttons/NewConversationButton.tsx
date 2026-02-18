'use client';
import { useRouter } from "next/navigation";
import NewConversationButtonView from "./NewConversationButtonView";
import { useCreateConversation } from "@/features/chat/hooks/use-create-conversation";

export default function NewConversationButton() {
    const createConversationMutation = useCreateConversation();
    const router = useRouter();
    // Handle the new conversation button click.
    const handleNewConversation = async () => {
        // Call the createConversation function to create a new conversation, and then navigate to the new conversation route.
        const result = await createConversationMutation.mutateAsync();
        // Navigate to the new conversation route.
        router.push(`/c/${result.id}`);
    };
    
    return (
        <NewConversationButtonView handleNewConversation={handleNewConversation} createConversationMutation={createConversationMutation} />
    )
}