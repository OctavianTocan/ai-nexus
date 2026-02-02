// Example: app/c/[conversationId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Chat } from "@/components/chat/chat";

// This page displays the chat for a specific conversation
// The conversationId comes from the URL, which is set when
// we create a new conversation OR when user clicks an existing one

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load conversation history if needed
    // For now, your Chat component handles the streaming
    // But you might want to fetch existing messages here
    async function loadConversation() {
      try {
        // Optional: Fetch conversation details
        // const response = await fetch(`/api/v1/conversations/${conversationId}`);
        // const data = await response.json();
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load conversation");
        setIsLoading(false);
      }
    }

    loadConversation();
  }, [conversationId]);

  if (isLoading) {
    return <div>Loading conversation...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Your Chat component would need to accept conversationId as a prop
  return (
    <Chat conversationId={conversationId} />
  );
}
