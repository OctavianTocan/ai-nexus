import ChatContainer from "@/features/chat/ChatContainer";

export default async function ConversationPage() {
  // The uuid we will use for the conversation if the user sends a message.
  const uuid: string = crypto.randomUUID();

  return (
    <div>
      <ChatContainer conversationId={uuid} />
    </div>
  );
}
