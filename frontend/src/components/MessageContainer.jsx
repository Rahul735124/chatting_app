import React, { useState } from 'react'
import SendInput from './SendInput'
import Messages from './Messages';
import { useSelector, useDispatch } from "react-redux";
import { setSelectedUser, updateBlockedUsers } from '../redux/userSlice';
import { removeMessages, censorMessages, setMessages } from '../redux/messageSlice';
import { IoArrowBack, IoTrash, IoEllipsisVertical, IoClose, IoVideocam, IoWarning } from "react-icons/io5";
import { useVideoCall } from '../hooks/useVideoCall';
import axios from 'axios';
import { BASE_URL } from '..';
import toast from 'react-hot-toast';

const MessageContainer = () => {
    const { selectedUser, authUser, onlineUsers } = useSelector(store => store.user);
    const { messages } = useSelector(store => store.message);
    const dispatch = useDispatch();

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [isBlocking, setIsBlocking] = useState(false);
    const { socket } = useSelector(store => store.socket);
    const { callUser } = useVideoCall();

    const isOnline = onlineUsers?.includes(selectedUser?._id);
    const isBlocked = authUser?.blockedUsers?.includes(selectedUser?._id);
    const amIBlocked = selectedUser?.blockedUsers?.includes(authUser?._id);

    React.useEffect(() => {
        if (selectedUser && authUser && socket) {
            socket.emit("markAsRead", { senderId: selectedUser._id, receiverId: authUser._id });
        }
    }, [selectedUser, messages, authUser, socket]);

    const toggleSelection = (msgId) => {
        if (selectedMessages.includes(msgId)) {
            setSelectedMessages(prev => prev.filter(id => id !== msgId));
        } else {
            setSelectedMessages(prev => [...prev, msgId]);
        }
    };

    const handleBlockUser = async () => {
        setIsBlocking(true);
        try {
            const res = await axios.post(`${BASE_URL}/api/v1/user/block/${selectedUser._id}`, {}, { withCredentials: true });
            if (res.data.success) {
                dispatch(updateBlockedUsers(res.data.user.blockedUsers));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to update block status");
        } finally {
            setIsBlocking(false);
        }
    };

    const handleClearChat = async () => {
        if (!window.confirm("Are you sure you want to clear the entire chat? This cannot be undone.")) return;
        try {
            const res = await axios.post(`${BASE_URL}/api/v1/message/delete`, {
                type: "CLEAR_CHAT",
                receiverId: selectedUser._id
            }, { withCredentials: true });
            
            if (res.data.success) {
                dispatch(setMessages([]));
                toast.success("Chat cleared");
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to clear chat");
        }
    };

    const handleSummarizeChat = async () => {
        if (!messages || messages.length === 0) return toast.error("No messages to summarize");
        setIsSummarizing(true);
        const last50Messages = messages.slice(-50).map(m => ({
            sender: m.senderId === authUser._id ? 'Me' : selectedUser.fullName,
            text: m.message
        }));
        
        const toastId = toast.loading("Summarizing chat...");
        try {
            const res = await axios.post(`${BASE_URL}/api/v1/ai/summarize`, { messages: last50Messages }, { withCredentials: true });
            toast.dismiss(toastId);
            toast(res.data.summary, { duration: 8000, icon: '✨' });
        } catch (error) {
            console.log(error);
            toast.dismiss(toastId);
            toast.error("Failed to summarize chat");
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleDeleteSelected = async (type) => {
        if (selectedMessages.length === 0) return;
        
        // "Delete for everyone" is only valid if ALL selected messages were sent by authUser
        if (type === "FOR_EVERYONE") {
            const allMine = selectedMessages.every(id => {
                const msg = messages.find(m => m._id === id);
                return msg && msg.senderId === authUser._id;
            });
            if (!allMine) {
                return toast.error("You can only delete your own messages for everyone.");
            }
        }

        try {
            const res = await axios.post(`${BASE_URL}/api/v1/message/delete`, {
                messageIds: selectedMessages,
                type
            }, { withCredentials: true });

            if (res.data.success) {
                if (type === "FOR_ME") {
                    dispatch(removeMessages(selectedMessages));
                } else if (type === "FOR_EVERYONE") {
                    dispatch(censorMessages(selectedMessages));
                }
                toast.success("Messages deleted");
                setIsSelectionMode(false);
                setSelectedMessages([]);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete messages");
        }
    };

    return (
        <>
            {
                selectedUser !== null ? (
                    <div className='flex-1 h-full w-full flex flex-col bg-zinc-900/50 md:bg-transparent'>
                        <div className='flex gap-2 items-center bg-zinc-900/80 backdrop-blur-md text-white px-4 py-3 border-b border-white/5'>
                            
                            {!isSelectionMode ? (
                                <>
                                    <button onClick={() => dispatch(setSelectedUser(null))} className="md:hidden p-2 text-white hover:bg-zinc-700 rounded-full">
                                        <IoArrowBack size={24} />
                                    </button>
                                    <div className={`avatar ${isOnline ? 'online' : ''}`}>
                                        <div className='w-12 rounded-full'>
                                            <img src={selectedUser?.profilePhoto} alt="user-profile" />
                                        </div>
                                    </div>
                                    <div className='flex flex-col flex-1'>
                                        <div className='flex justify-between gap-2'>
                                            <p className="font-semibold">{selectedUser?.fullName}</p>
                                        </div>
                                        <p className={`text-xs ${isOnline ? "text-green-400" : "text-gray-400"}`}>
                                            {isOnline ? "Online" : selectedUser?.lastSeen ? 
                                                `Last seen ${new Date(selectedUser.lastSeen).toLocaleDateString()} at ${new Date(selectedUser.lastSeen).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
                                                : "Offline"}
                                        </p>
                                    </div>

                                    {/* Video Call Button */}
                                    <button onClick={() => callUser(selectedUser._id)} className="btn btn-ghost btn-circle text-white hover:bg-zinc-700">
                                        <IoVideocam size={24} />
                                    </button>

                                    {/* 3-dots Menu */}
                                    <div className="dropdown dropdown-end">
                                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                                            <IoEllipsisVertical size={24} />
                                        </div>
                                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-zinc-700 rounded-box w-52">
                                            <li><button onClick={() => setIsSelectionMode(true)}>Select Messages</button></li>
                                            <li><button onClick={handleSummarizeChat} disabled={isSummarizing} className="text-emerald-400">✨ Summarize Chat</button></li>
                                            <li><button onClick={handleBlockUser} disabled={isBlocking} className="text-orange-400">{isBlocked ? "Unblock User" : "Block User"}</button></li>
                                            <li><button onClick={handleClearChat} className="text-red-400">Clear Chat</button></li>
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Selection Mode Header */}
                                    <button onClick={() => { setIsSelectionMode(false); setSelectedMessages([]); }} className="p-2 text-white hover:bg-zinc-700 rounded-full">
                                        <IoClose size={24} />
                                    </button>
                                    <div className='flex-1'>
                                        <p className="font-semibold">{selectedMessages.length} Selected</p>
                                    </div>
                                    
                                    {selectedMessages.length > 0 && (
                                        <div className="dropdown dropdown-end">
                                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-red-500 hover:bg-zinc-700">
                                                <IoTrash size={24} />
                                            </div>
                                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-zinc-700 rounded-box w-52 mt-4">
                                                <li><button onClick={() => handleDeleteSelected('FOR_ME')}>Delete for me</button></li>
                                                <li><button onClick={() => handleDeleteSelected('FOR_EVERYONE')}>Delete for everyone</button></li>
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <Messages 
                            isSelectionMode={isSelectionMode} 
                            selectedMessages={selectedMessages} 
                            toggleSelection={toggleSelection} 
                        />
                        
                        {!isSelectionMode && (
                            isBlocked ? (
                                <div className="p-4 text-center text-gray-400 bg-zinc-800/50 m-4 rounded-xl border border-white/5">
                                    <IoWarning size={24} className="mx-auto mb-2 text-orange-400" />
                                    You have blocked this user. Unblock to send messages.
                                </div>
                            ) : amIBlocked ? (
                                <div className="p-4 text-center text-gray-400 bg-zinc-800/50 m-4 rounded-xl border border-white/5">
                                    <IoWarning size={24} className="mx-auto mb-2 text-red-400" />
                                    You cannot reply to this conversation.
                                </div>
                            ) : (
                                <SendInput />
                            )
                        )}
                    </div>
                ) : (
                    <div className='hidden md:flex flex-1 h-full w-full flex-col justify-center items-center bg-zinc-900/50 md:bg-transparent'>
                        <div className="bg-zinc-900/50 p-8 rounded-3xl backdrop-blur-md border border-white/5 shadow-xl text-center">
                            <h1 className='text-4xl text-white font-bold mb-2'>Hi, {authUser?.fullName} 👋</h1>
                            <h1 className='text-lg text-gray-300'>Select a chat to start messaging</h1>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default MessageContainer