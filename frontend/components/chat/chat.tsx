'use client';
import {
    Message,
    MessageContent,
    MessageResponse,
} from '@/components/ai-elements/message';
import { Conversation } from '../ai-elements/conversation';
const Chat = () => {
    return (
        <>
            <div className='w-full h-full'>
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
                </div>
            </div>
        </>
    );
};
export default Chat;