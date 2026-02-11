"use client";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Conversation, ConversationContent } from "../ai-elements/conversation";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from "../ai-elements/prompt-input";
import type { PromptInputMessage } from "../ai-elements/prompt-input";
import { useState, useEffect } from "react";
import { Loader } from "../ai-elements/loader";
import { useStickToBottomContext } from "use-stick-to-bottom";
import { useChat } from "@/hooks/use-chat";
import type { AgnoMessage } from "@/app/c/[conversationId]/page";

/*
  Props for the Chat component.
  Args:
    conversationId: The ID of the conversation to link messages to. (When not provided, we create a new conversation.)
*/
type ChatProps = {
  // The ID of the conversation to link messages to. (When not provided, we create a new conversation.)
  conversationId: string;
  // The messages to display in the chat. (These are the messages that are already in the conversation when we load it.)
  messages: Array<AgnoMessage>;
};

// Scroll to bottom of the chat when the chat history changes.
const ChatScrollAnchor = ({ track }: { track: number }) => {
  // Get the scroll to bottom context. (This works because the Conversation component is a child of the ConversationContent component, and that has the useStickToBottomContext hook.)
  const { scrollToBottom } = useStickToBottomContext();

  // Scroll to bottom of the chat when the chat history changes.
  useEffect(() => {
    scrollToBottom();
  }, [track, scrollToBottom]);
  return null;
};

// TODO: We need to use the conversationId to get the messages for the conversation from the backend database.
const Chat = ({ conversationId, messages }: ChatProps) => {

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

    console.log("newMessage", newMessage);

    // Placeholder for the assistant message.
    let assistantMessage = "";

    // Stream the response to the conversation with the given conversationId.
    for await (const chunk of streamMessage(newMessage.content, conversationId)) {
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

    console.log("assistantMessage", assistantMessage);
  };

  return (
    <>
      <div className="fixed inset-0 overflow-hidden">
        <div className="w-[40%] mx-auto h-screen flex flex-col overflow-hidden">
          <Conversation className="flex-1 overflow-y-auto" resize="smooth">
            <ConversationContent>
              {chatHistory.length === 0 ? (
                <div className="text-center my-auto font-semibold mt-8">
                  <p className="text-3xl mt-4 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                    What can we build together?
                  </p>
                </div>
              ) : (
                <>
                  {/* Chat History */}
                  {chatHistory.map((message, index) => {
                    return (
                      <Message from={message.role} key={index}>
                        <MessageContent>
                          <MessageResponse>{message.content}</MessageResponse>
                        </MessageContent>
                      </Message>
                    );
                  })}
                  {/* Loading Spinner */}
                  {isLoading && (
                    <Message from="assistant">
                      <MessageContent>
                        <div className="flex items-center gap-2">
                          <Loader />
                          Thinking...
                        </div>
                      </MessageContent>
                    </Message>
                  )}
                </>
              )}
            </ConversationContent>
            <ChatScrollAnchor track={chatHistory.length} />
          </Conversation>
          {/* Composer */}
          <PromptInput
            onSubmit={(message) => handleSendMessage(message)}
            className="mb-4 px-2"
          >
            {/* Text Area */}
            <PromptInputTextarea
              placeholder="Ask anything about your memories or search the web..."
              className="pr-16 bg-white min-h-12.5"
              onChange={(e) =>
                setMessage({ ...message, content: e.currentTarget.value })
              }
              value={message.content}
            />
            {/* Send Button */}
            <PromptInputSubmit
              disabled={message.content.length === 0}
              className="absolute bottom-1 right-1 cursor-pointer"
              status={isLoading ? "streaming" : "ready"}
            />
          </PromptInput>
        </div>
      </div>
    </>
  );
};

// Export the Chat component.
export default Chat;
