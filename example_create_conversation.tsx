// Example: How to create and navigate to a new conversation

"use client";

import { useRouter } from "next/navigation";

// Helper function to create a new conversation
async function createNewConversation() {
  const response = await fetch("/api/v1/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Body can be empty since ConversationCreate is just a placeholder
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error("Failed to create conversation");
  }

  const data = await response.json();
  return data.id; // Returns the UUID of the new conversation
}

// Example component: Landing page or sidebar
export default function ConversationStarter() {
  const router = useRouter();

  const handleNewChat = async () => {
    try {
      // 1. Create conversation on backend
      const newConversationId = await createNewConversation();

      // 2. Navigate to it - single client-side transition!
      router.push(`/c/${newConversationId}`);

      // User is now at /c/abc-123-..., seeing the chat interface
    } catch (error) {
      console.error("Failed to create conversation:", error);
      // Show error to user
      alert("Could not start a new conversation. Please try again.");
    }
  };

  return (
    <button onClick={handleNewChat}>
      Start New Conversation
    </button>
  );
}
