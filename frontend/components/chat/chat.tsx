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
        const response = await fetch(`http://localhost:8000/api/chat`, {
            method: 'POST',
            body: JSON.stringify({ question: message }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
            },
        });

        // Check if the response is ok.
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail);
        }

        // 1. Check if body exists.
        if (!response.body) throw new Error('Failed to get body');

        // 2. Transform the stream
        // .pipeThrough() takes the raw bytes and runs them through the decoder
        // .getReader() gives us a way to read the resulting text
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

        let buffer = '';
        while (true) {
            // 3. Read the next chunk.
            const { done, value } = await reader.read();

            // 4. If the stream is done, break the loop.
            if (done) break;

            // 5. Add the new text to our buffer.
            buffer += value;

            // 6. Split buffer by newlines to find individual messages. (SSE events are delimited by newlines).
            const messages = buffer.split('\n\n');

            // 7. Save the last piece. The last item in the array is usually incomplete, so we save it to the buffer. We pop it off and add it back to the buffer.
            buffer = messages.pop() || '';

            // 8. Process each message.
            for (const message of messages) {
                // 9. Check for the SSE delimiter.
                if (message.startsWith('data: ')) {
                    // 10. Remove the 'data: ' prefix.
                    const data = message.slice(6);

                    // 11. Handle the stream end event.
                    if (data === '[DONE]') {
                        // 12. Stop the loading state.
                        setIsLoading(false);
                        // 13. Return the result string.
                        return buffer;
                    }

                    try {
                        // 12. Parse the message as JSON.
                        const json = JSON.parse(data);

                        if (json.type === 'delta') {
                            // 13. Accumulate the delta content.
                            buffer += json.content;
                        }
                    } catch (error) {
                        // Ignore errors for incomplete messages.
                        continue;
                    }
                }
            }
        }

        // // Get the reader from the response body.
        // const reader = response.body?.getReader();
        // if (!reader) throw new Error('Failed to get reader');
        // // Create a decoder to decode the response body.
        // const decoder = new TextDecoder();
        // // Initialize the result string.
        // let result = '';
        // // Read the response body.
        // while (true) {
        //     // Read the next chunk.
        //     const { done, value } = await reader.read();
        //     if (done || !value) break;
        //     // Decode the chunk and add it to the result string.
        //     result += decoder.decode(value, { stream: true });
        //     console.log(JSON.parse(result).data);

        //     // Stop the loading state.
        //     setIsLoading(false);
        // }
        // Return the result string.
        return result;
    }
    return (
        <>
            <div className="fixed inset-0 overflow-hidden">
                <div className='w-[30%] mx-auto h-screen flex flex-col overflow-hidden'>
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {chatHistory.length === 0 ? (
                            <div className="text-center absolute top-1/2 -translate-y-40 left-1/2 -translate-x-1/2 font-semibold mt-8">
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