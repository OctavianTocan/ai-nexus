'use client';
// TODO: Make this a server component. There's really no need for client-side state here.

import useCreateConversation from "@/hooks/use-create-conversation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Page is the landing page of the application.
 * It displays a button to create a new conversation.
 * When the button is clicked, it creates a new conversation and navigates to the new conversation route.
 *
 * @returns The landing page of the application.
 */
export default function Page() {
  const router = useRouter();
  // Create a new conversation. Returns a function that creates a new conversation.
  const createConversation = useCreateConversation();

  // Handle the new conversation button click.
  const handleNewConversation = async () => {
    // Call the createConversation function to create a new conversation, and then navigate to the new conversation route.
    const newConversationId = await createConversation();
    // Navigate to the new conversation route.
    router.push(`/c/${newConversationId}`);
  };

  // Render the page.
  return (
    <div className="flex justify-center h-screen items-center">
      <Button className="w-50 mx-auto cursor-pointer h-10" onClick={handleNewConversation}>New Conversation</Button>
    </div>
  )
}
