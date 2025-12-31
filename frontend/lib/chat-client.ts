/**
 * Streams chat responses from the backend server using Server-Sent Events (SSE).
 * 
 * This function sends the user's message to the chat API and yields streamed chunks of the assistant's reply
 * as they are received from the backend.
 * 
 * @param {string} message - The user input message to send to the chat API.
 * @yields {AsyncGenerator<string>} - Yields each chunk of the assistant's reply as they are streamed from the server.
 * @throws {Error} If the API response is not OK or the response body is missing.
 */
export class ChatClient {
    static async* streamMessage(message: string): AsyncGenerator<string> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
            method: 'POST',
            body: JSON.stringify({ question: message }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
            },
            credentials: 'include',
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
                        // 13. Return the result string.
                        yield buffer;
                    }

                    try {
                        // 12. Parse the message as JSON.
                        const json = JSON.parse(data);

                        // 13. Yield the delta content.
                        yield json.type === 'delta' ? json.content : null;
                    } catch (error) {
                        // Ignore errors for incomplete messages.
                    }
                }
            }
        }
    }
}