'use client';
import {
    Message,
    MessageContent,
    MessageResponse,
} from '@/components/ai-elements/message';
import { Conversation, ConversationContent } from '../ai-elements/conversation';
import { PromptInput, PromptInputSubmit, PromptInputTextarea, PromptInputMessage } from '../ai-elements/prompt-input';
import { useState } from 'react';
import { Loader } from '../ai-elements/loader';
import { ChatClient } from '@/lib/chat-client'
const Chat = () => {
    // Chat History Array.
    const [chatHistory, setChatHistory] = useState<
        Array<{
            type: 'user' | 'assistant';
            content: string;
        }>
    >([]);
    // Loading State.
    const [isLoading, setIsLoading] = useState(false);

    // Add the user message to the chat history.
    const handleSendMessage = async (message: PromptInputMessage) => {
        // Start the loading state.
        setIsLoading(true);

        // Add the user message to the chat history.
        setChatHistory((prev) => [...prev,
        { type: 'user', content: message.text },
        { type: "assistant", content: '' },
        ]);

        // Placeholder for the assistant message.
        let assistantMessage = '';

        // Stream the response.
        for await (const chunk of ChatClient.streamMessage(message.text)) {
            assistantMessage += chunk || '';
            // Update the assistant message in the chat history.
            setChatHistory((prev) => {
                // Create a new chat history array.
                const newChatHistory = [...prev];
                // Update the assistant message in the chat history.
                const newMessageIndex = newChatHistory.length - 1;
                newChatHistory[newMessageIndex] = { ...newChatHistory[newMessageIndex], content: assistantMessage };
                return newChatHistory;
            });
            // Stop the loading state. (We're already receiving the response, so we can stop the loading state).
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className="fixed inset-0 overflow-hidden">
                <div className='w-[30%] mx-auto h-screen flex flex-col overflow-hidden'>
                    {chatHistory.length === 0 ? (
                        <div className="text-center absolute top-1/2 -translate-y-40 left-1/2 -translate-x-1/2 font-semibold mt-8">
                            <p className="text-3xl mt-4">What can we build together?</p>
                        </div>
                    ) : (
                        <>
                            <Conversation className='flex-1 overflow-y-auto' resize="auto">
                                <ConversationContent>
                                    {/* Chat History */}
                                    {chatHistory.map((message, index) => {
                                        return (
                                            <Message from={message.type} key={index}>
                                                <MessageContent>
                                                    <MessageResponse>{message.content}</MessageResponse>
                                                </MessageContent>
                                            </Message>
                                        )
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
                                </ConversationContent>
                            </Conversation>
                        </>
                    )}
                    {/* Composer */}
                    <PromptInput onSubmit={(message) => handleSendMessage(message)} className='mb-4 px-2'>
                        {/* Text Area */}
                        <PromptInputTextarea placeholder='Ask anything about your memories or search the web...' className='pr-16 bg-white min-h-[50px]' />
                        {/* Send Button */}
                        <PromptInputSubmit className='absolute bottom-1 right-1 cursor-pointer'
                            status={isLoading ? 'streaming' : 'ready'}></PromptInputSubmit>
                    </PromptInput>
                </div>
            </div>
        </>
    );
};
export default Chat;