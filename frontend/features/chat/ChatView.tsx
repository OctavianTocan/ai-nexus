"use client";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Conversation,
  ConversationContent,
} from "../../components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from "../../components/ai-elements/prompt-input";
import type { PromptInputMessage } from "../../components/ai-elements/prompt-input";
import { useState, useEffect } from "react";
import { Loader } from "../../components/ai-elements/loader";
import { useStickToBottomContext } from "use-stick-to-bottom";
import type { AgnoMessage } from "@/lib/types";

/*
  Props for the Chat component.
  Args:
    conversationId: The ID of the conversation to link messages to. (When not provided, we create a new conversation.)
*/
type ChatProps = {
  message: PromptInputMessage;
  // Whether the chat is currently loading a response. This is used to show a loading spinner in the UI while we're waiting for a response from the assistant.
  isLoading?: boolean;

  onUpdateMessage: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSendMessage: (message: PromptInputMessage) => void;

  chatHistory: Array<AgnoMessage>;
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

const ChatView = ({ message, isLoading, chatHistory, onSendMessage, onUpdateMessage }: ChatProps) => {
  return (
    <>
      <div className="overflow-hidden sm:max-w-[80%] lg:max-w-[60%] xl:max-w-[50%] mx-auto">
        <div className="h-[90vh] flex flex-col overflow-hidden">
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
            onSubmit={onSendMessage}
            className="px-2 pb-2"
          >
            {/* Text Area */}
            <PromptInputTextarea
              placeholder="Ask anything about your memories or search the web..."
              className="pr-16 bg-white min-h-12.5"
              onChange={onUpdateMessage}
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
export default ChatView;
