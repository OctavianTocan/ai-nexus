// Example: app/c/[conversationId]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

// This page receives the conversationId from the URL
// But the transition TO this page is seamless (client-side only)

export default function ConversationPage() {
  const params = useParams(); // { conversationId: "abc-123" }
  const router = useRouter();

  const [conversationId, setConversationId] = useState<string>(params.conversationId as string);

  // Switch to a different conversation - seamless transition!
  const handleSwitchConversation = (newId: string) => {
    router.push(`/c/${newId}`); // ← Client-side navigation, no reload!
  };

  return (
    <div className="flex">
      {/* Sidebar with conversation list */}
      <aside className="w-64 border-r p-4">
        <h2>Conversations</h2>
        <button onClick={() => handleSwitchConversation("abc-123")}>
          Conversation 1
        </button>
        <button onClick={() => handleSwitchConversation("xyz-789")}>
          Conversation 2
        </button>
      </aside>

      {/* Main chat area */}
      <main className="flex-1">
        <p>Current conversation: {conversationId}</p>
        {/* Your Chat component would go here */}
      </main>
    </div>
  );
}
