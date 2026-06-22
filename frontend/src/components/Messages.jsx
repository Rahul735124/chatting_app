import React, { useEffect, useRef } from 'react'
import Message from './Message'
import useGetMessages from '../hooks/useGetMessages';
import { useSelector } from "react-redux";

const Messages = ({ isSelectionMode, selectedMessages, toggleSelection }) => {
    useGetMessages();
    const { messages } = useSelector(store => store.message);
    const { typingUserIds, selectedUser } = useSelector(store => store.user);
    const scrollRef = useRef();

    useEffect(() => {
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, [messages, typingUserIds]);

    const isTyping = selectedUser && typingUserIds?.includes(selectedUser._id);
    
    return (
        <div className='px-4 flex-1 overflow-auto'>
            {
               messages && messages?.map((message) => {
                    return (
                        <Message 
                            key={message._id} 
                            message={message} 
                            isSelectionMode={isSelectionMode}
                            isSelected={selectedMessages.includes(message._id)}
                            toggleSelection={toggleSelection}
                        />
                    )
                })
            }
            {isTyping && (
                <div className="chat chat-start">
                    <div className="chat-bubble bg-gray-600 text-white flex items-center gap-2 max-w-[120px] h-10 px-4">
                        <span className="loading loading-dots loading-sm"></span>
                    </div>
                </div>
            )}
            <div ref={scrollRef} />
        </div>
    )
}

export default Messages