import { useState } from "react";
import ChatView from "./ChatView";
import type { AgnoMessage } from "@/app/(app)/page";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { useChat } from "@/features/chat/hooks/use-chat";

export default function Chat() {
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Array<AgnoMessage>>([]);

  // Chat Hook.
  const { streamMessage } = useChat();

  // Message State.
  const [message, setMessage] = useState<PromptInputMessage>({
    content: "",
    files: [],
  });
  // Chat History Array.
  // TODO: Do we actually need this if we already have the messages in the props?
  const [chatHistory, setChatHistory] = useState<Array<AgnoMessage>>(messages);
  // Loading State.
  const [isLoading, setIsLoading] = useState(false);

  // Add the user message to the chat history.
  const handleSendMessage = async (message: PromptInputMessage) => {
    const newMessage = message;
    // Reset the message state. (So we can see that there's no more text in the text area, without this the text area will still show the previous message).
    setMessage({ content: "", files: [] });

    // Start the loading state.
    setIsLoading(true);

    // Add the user message to the chat history.
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: newMessage.content } as AgnoMessage,
      { role: "assistant", content: "" } as AgnoMessage,
    ]);

    // Placeholder for the assistant message.
    let assistantMessage = "";

    // Stream the response to the conversation with the given conversationId.
    for await (const chunk of streamMessage(
      newMessage.content,
      conversationId,
    )) {
      assistantMessage += chunk || "";
      // Update the assistant message in the chat history.
      setChatHistory((prev) => {
        // Create a new chat history array.
        const newChatHistory = [...prev];
        // Update the assistant message in the chat history.
        // Info: Need to define all properties, so we satisfy the Typescript compiler, because using the spread operator (...) can sometimes result in optional properties being treated as undefined.
        const newMessageIndex = newChatHistory.length - 1;
        newChatHistory[newMessageIndex] = {
          ...newChatHistory[newMessageIndex],
          role: "assistant",
          content: assistantMessage,
        };
        return newChatHistory;
      });
      // Stop the loading state. (We're already receiving the response, so we can stop the loading state).
      setIsLoading(false);
    }
  };

  return <ChatView conversationId={conversationId} messages={messages} />;
}
