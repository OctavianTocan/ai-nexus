import ChatContainer from "@/features/chat/ChatContainer";

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

export default async function ConversationPage() {
  // TODO: We want to show a chat here, and only really create a new conversation if the user sends a message. Then, it'll be easier to create the conversation directly with a title, using the user's first message as the title.
  // Render the chat component.
  return (
    <div>
      <ChatContainer />
    </div>
  );
}
