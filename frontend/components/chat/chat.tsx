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
        setChatHistory((prev) => [...prev, { type: 'user', content: message.text }])
        // Send the message to the assistant.
        const assistantMessage = await sendMessageToAssistant(message.text)
        // Add the assistant message to the chat history.
        setChatHistory((prev) => [...prev, { type: 'assistant', content: assistantMessage }])

        // Stop the loading state.
        setIsLoading(false);
    }

    // Send the message to the backend.
    const sendMessageToAssistant = async (message: string) => {
        const response = await fetch(`http://localhost:8000/api/chat?question=${encodeURIComponent(message)}`, {
            method: 'POST'
        });
        const data = await response.json();
        console.log(data);
        return data.response.content;
    }
    return (
        <>
            <div className="fixed inset-0 overflow-hidden">
                <div className='w-[60%] mx-auto h-screen flex flex-col overflow-hidden'>
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {chatHistory.length === 0 ? (
                            <div className="text-center font-semibold mt-8">
                                <p className="text-3xl mt-4">What can we build together?</p>
                            </div>
                        ) : (
                            <>
                                <Conversation className='flex-1 overflow-y-auto' children={
                                    <ConversationContent>
                                        {chatHistory.map((message, index) => {
                                            return (
                                                <Message from={message.type} key={index}>
                                                    <MessageContent>
                                                        <MessageResponse>{message.content}</MessageResponse>
                                                    </MessageContent>
                                                </Message>
                                            )
                                        })}
                                    </ConversationContent>
                                }>
                                </Conversation>
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
                    </div>
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