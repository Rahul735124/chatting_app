import React, { useEffect, useRef, useState } from 'react'
import {useSelector, useDispatch} from "react-redux";
import { setReplyingToMessage } from "../redux/messageSlice";

const Message = ({message, isSelectionMode, isSelected, toggleSelection}) => {
    const scroll = useRef();
    const [showActions, setShowActions] = useState(false);
    const dispatch = useDispatch();
    const {authUser, selectedUser, onlineUsers} = useSelector(store=>store.user);
    const { socket } = useSelector(store => store.socket);
    const isOnline = onlineUsers?.includes(selectedUser?._id);

    const isAuthUser = message?.senderId?.toString() === authUser?._id?.toString();

    const handleReaction = (emoji) => {
        if (socket && selectedUser && authUser) {
            socket.emit("reactMessage", {
                messageId: message._id,
                emoji,
                senderId: authUser._id,
                receiverId: selectedUser._id
            });
        }
    };

    useEffect(()=>{
        scroll.current?.scrollIntoView({behavior:"smooth"});
    },[message]);
    
    return (
        <div 
            ref={scroll} 
            className={`flex items-center gap-2 ${isAuthUser ? 'justify-end' : 'justify-start'} ${isSelectionMode ? 'cursor-pointer hover:bg-zinc-800/50 p-2 rounded-md transition-colors' : ''}`}
            onClick={() => {
                if (isSelectionMode) toggleSelection(message._id);
            }}
        >
            {isSelectionMode && !isAuthUser && (
                <input type="checkbox" checked={isSelected} readOnly className="checkbox checkbox-primary checkbox-sm mt-8" />
            )}
            
            <div className={`chat ${isAuthUser ? 'chat-end' : 'chat-start'} flex-1 group`}>
                <div className="chat-image avatar">
                    <div className={`w-10 rounded-full ${message.isBot ? 'ring ring-emerald-500 ring-offset-base-100 ring-offset-2' : ''}`}>
                        <img alt="profile" src={message.isBot ? "https://cdn-icons-png.flaticon.com/512/8649/8649603.png" : (isAuthUser ? authUser?.profilePhoto  : selectedUser?.profilePhoto) } />
                    </div>
                </div>
                <div 
                    className={`chat-bubble relative ${message.isBot ? 'bg-zinc-800 text-emerald-50 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : (!isAuthUser ? 'bg-gray-200 text-black' : '')} ${message.message === "🚫 This message was deleted" || message.isDeleted ? 'italic text-gray-500' : ''} flex flex-col gap-2`}
                    onDoubleClick={() => setShowActions(!showActions)}
                >
                    
                    {message.isBot && <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">✨ AI Assistant</div>}
                    
                    {message.replyTo && (
                        <div className="bg-black/20 p-2 rounded-md text-xs border-l-4 border-emerald-500 mb-1 opacity-80 cursor-pointer" onClick={() => {
                            // Can add scroll to replied message here if we had references
                        }}>
                            <span className="font-bold text-emerald-500 block mb-1">Replying to {message.replyTo.senderId === authUser._id ? "yourself" : selectedUser.fullName}</span>
                            {message.replyTo.message && <p className="truncate max-w-[150px]">{message.replyTo.message}</p>}
                            {message.replyTo.image && <span className="italic">📷 Media</span>}
                        </div>
                    )}

                    {message?.image && (
                        message.image.match(/\.(webm|mp3|ogg|wav)$/i) ? (
                            <audio controls src={message.image} className="max-w-[200px]" />
                        ) : (
                            <img src={message.image} alt="attachment" className="rounded-md max-w-[200px] max-h-[200px] object-cover" />
                        )
                    )}
                    {message?.message && <span>{message?.message}</span>}

                    {message.reactions && message.reactions.length > 0 && (
                        <div className={`absolute -bottom-3 ${isAuthUser ? 'right-2' : 'left-2'} bg-zinc-700 rounded-full px-1.5 py-0.5 text-[10px] flex gap-0.5 border border-zinc-600 shadow-md`}>
                            {message.reactions.map((r, idx) => (
                                <span key={idx}>{r.emoji}</span>
                            ))}
                        </div>
                    )}

                    {!isSelectionMode && (
                        <div className={`${showActions ? 'flex' : 'hidden group-hover:flex'} absolute -bottom-10 ${isAuthUser ? 'right-0' : 'left-0'} bg-zinc-800 rounded-full px-2 py-1 gap-2 shadow-lg border border-zinc-600 z-[60] items-center`}>
                            {["👍", "❤️", "😂", "😮", "😢", "🙏"].map(emoji => (
                                <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReaction(emoji); setShowActions(false); }} className="hover:scale-125 transition-transform text-lg">
                                    {emoji}
                                </button>
                            ))}
                            <div className="w-[1px] h-5 bg-gray-500 mx-1"></div>
                            <button onClick={(e) => { e.stopPropagation(); dispatch(setReplyingToMessage(message)); setShowActions(false); }} className="hover:scale-125 transition-transform text-gray-300 px-1 font-bold text-xs flex items-center gap-1">
                                ↩️
                            </button>
                        </div>
                    )}
                </div>
                <div className="chat-footer opacity-70 flex gap-1 items-center mt-1">
                    <time className="text-[10px] text-gray-300">
                        {message?.createdAt ? new Date(message?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                    </time>
                    {isAuthUser && (
                        <span className="text-xs ml-1 tracking-tighter">
                            {message.isRead ? (
                                <span className="text-blue-400 font-bold">✓✓</span>
                            ) : isOnline ? (
                                <span className="text-gray-400 font-bold">✓✓</span>
                            ) : (
                                <span className="text-gray-400 font-bold">✓</span>
                            )}
                        </span>
                    )}
                </div>
            </div>

            {isSelectionMode && isAuthUser && (
                <input type="checkbox" checked={isSelected} readOnly className="checkbox checkbox-primary checkbox-sm mt-8" />
            )}
        </div>
    )
}

export default Message