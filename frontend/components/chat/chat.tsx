'use client';
import {
    Message,
    MessageContent,
    MessageResponse,
} from '@/components/ai-elements/message';
import { Conversation } from '../ai-elements/conversation';
import { PromptInput, PromptInputSubmit, PromptInputTextarea } from '../ai-elements/prompt-input';
const Chat = () => {
    return (
        <>
            <div className='size-full'>
                <div className='w-[40%] mt-[5%] mx-auto'>
                    <Conversation children={
                        <>
                            <Message from="user">
                                <MessageContent>
                                    <MessageResponse>CENTER</MessageResponse>
                                </MessageContent>
                            </Message>
                            <Message from="assistant">
                                <MessageContent>
                                    <MessageResponse>CENTER</MessageResponse>
                                </MessageContent>
                            </Message>
                        </>
                    }>
                    </Conversation>
                    {/* Composer */}
                    <PromptInput onSubmit={(message) => console.log(message)} className='mt-[5%]'>
                        {/* Text Area */}
                        <PromptInputTextarea placeholder='Ask anything about your memories or search the web...' className='pr-16 bg-white min-h-[50px]' />
                        {/* Send Button */}
                        <PromptInputSubmit className='absolute bottom-1 right-1 cursor-pointer'></PromptInputSubmit>
                    </PromptInput>
                </div>
            </div>
        </>
    );
};
export default Chat;