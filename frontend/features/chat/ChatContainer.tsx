import ChatView from "./ChatView";
import type { AgnoMessage } from "@/app/(app)/page";

interface ChatContainerProps {
  conversationId?: string;
  messages?: Array<AgnoMessage>;
}

export default function ChatContainer({ conversationId, messages }: ChatContainerProps) {
  return <ChatView conversationId={conversationId} messages={messages} />;
}