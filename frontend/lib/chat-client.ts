import { useAuthedFetch } from "./use-authed-fetch";

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
        // Get the authed fetch function.
        const authedFetch = useAuthedFetch();

        // Send the message to the chat API, and get the response.
        const response = await authedFetch('/api/chat', {
            method: 'POST',
            body: JSON.stringify({ question: message }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
            },
        });

        // TODO: For some reason, we're not getting a response from the chat API.
        console.log("response", response);

        // Handle errors.
        if (!response.body) throw new Error('Failed to get body');

        // Transform the stream.
        // .pipeThrough() takes the raw bytes and runs them through the decoder.
        // .getReader() gives us a way to read the resulting text.
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

        // Buffer to store the streamed text.
        let buffer = '';

        // While the stream is not done, read the next chunk.
        while (true) {
            // Read the next chunk.
            const { done, value } = await reader.read();

            // If the stream is done, break the loop.
            if (done) break;

            // Add the new text to our buffer.
            buffer += value;

            // Split buffer by newlines to find individual messages. (SSE events are delimited by newlines).
            const messages = buffer.split('\n\n');

            // Save the last piece. The last item in the array is usually incomplete, so we save it to the buffer. We pop it off and add it back to the buffer.
            buffer = messages.pop() || '';

            // Process each message.
            for (const message of messages) {
                // Check for the SSE delimiter.
                if (message.startsWith('data: ')) {
                    // Remove the 'data: ' prefix.
                    const data = message.slice(6);

                    // Handle the stream end event.
                    if (data === '[DONE]') {
                        // Return the result string.
                        yield buffer;
                    }

                    try {
                        // Parse the message as JSON.
                        const json = JSON.parse(data);

                        // Yield the delta content.
                        yield json.type === 'delta' ? json.content : null;
                    } catch (error) {
                        // Ignore errors for incomplete messages.                  
                        console.log("chat-client", error);
                    }
                }
            }
        }
    }
}