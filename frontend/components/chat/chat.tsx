'use client';
import {
    Message,
    MessageContent,
    MessageResponse,
} from '@/components/ai-elements/message';
import { Conversation } from '../ai-elements/conversation';
import { PromptInput, PromptInputAttachment, PromptInputAttachments, PromptInputBody, PromptInputButton, PromptInputFooter, PromptInputHeader, PromptInputSubmit, PromptInputTextarea } from '../ai-elements/prompt-input';
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
                        {/* Header */}
                        {/* <PromptInputHeader> */}
                        {/* Attachments */}
                        {/* <PromptInputAttachments> */}
                        {/* {
                                    (attachment) => <PromptInputAttachment data={attachment} />
                                } */}
                        {/* </PromptInputAttachments> */}
                        {/* </PromptInputHeader> */}

                        {/* Body */}
                        <PromptInputBody className=''>
                            <PromptInputTextarea placeholder='Ask something...' className='pr-12 min-h-[60px]' />
                            <PromptInputSubmit className='absolute bottom-1 right-1'>Send</PromptInputSubmit>
                        </PromptInputBody>
                    </PromptInput>
                </div>
            </div>
        </>
    );
};
export default Chat;