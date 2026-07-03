import React, { useState, useRef } from 'react'
import { IoSend, IoHappyOutline, IoAttachOutline, IoClose, IoMicOutline, IoStopOutline, IoSparkles } from "react-icons/io5";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setMessages, setReplyingToMessage, setAiSuggestions, setAiCompletion } from '../redux/messageSlice';
import { BASE_URL } from '..';
import EmojiPicker from 'emoji-picker-react';

const SendInput = () => {
    const [message, setMessage] = useState("");
    const [file, setFile] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const typingTimeoutRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const dispatch = useDispatch();
    const { selectedUser, authUser } = useSelector(store => store.user);
    const { messages, replyingToMessage, aiSuggestions, aiCompletion } = useSelector(store => store.message);
    const { socket } = useSelector(store => store.socket);
    const [isAiLoadingSuggestions, setIsAiLoadingSuggestions] = useState(false);
    const autoCompleteTimeoutRef = useRef(null);

    const handleAiSuggest = async () => {
        if (!messages || messages.length === 0) return;
        const lastMessage = messages[messages.length - 1];
        setIsAiLoadingSuggestions(true);
        try {
            const res = await axios.post(`${BASE_URL}/api/v1/ai/suggestions`, { message: lastMessage.message }, {
                withCredentials: true
            });
            dispatch(setAiSuggestions(res.data.suggestions));
        } catch (error) {
            console.log(error);
        } finally {
            setIsAiLoadingSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setMessage(suggestion);
        dispatch(setAiSuggestions([]));
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], "voice.webm", { type: 'audio/webm' });
                setFile(audioFile);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone", error);
            alert("Microphone access denied. Please allow microphone permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleTyping = (e) => {
        const val = e.target.value;
        setMessage(val);
        dispatch(setAiCompletion(""));

        if (!socket || !selectedUser || !authUser) return;

        socket.emit("typing", { senderId: authUser._id, receiverId: selectedUser._id });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { senderId: authUser._id, receiverId: selectedUser._id });
        }, 2000);

        if (autoCompleteTimeoutRef.current) clearTimeout(autoCompleteTimeoutRef.current);
        if (val.trim().length > 3) {
            autoCompleteTimeoutRef.current = setTimeout(async () => {
                try {
                    const res = await axios.post(`${BASE_URL}/api/v1/ai/complete`, { prefix: val }, {
                        withCredentials: true
                    });
                    dispatch(setAiCompletion(res.data.completion));
                } catch (error) {
                    console.log(error);
                }
            }, 500);
        }
    };

    const acceptCompletion = (e) => {
        if (e.key === 'Tab' && aiCompletion) {
            e.preventDefault();
            setMessage(message + (aiCompletion.startsWith(message) ? aiCompletion.slice(message.length) : aiCompletion));
            dispatch(setAiCompletion(""));
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!message.trim() && !file) return;

        // Immediately stop typing
        if (socket && selectedUser && authUser) {
            socket.emit("stopTyping", { senderId: authUser._id, receiverId: selectedUser._id });
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }

        const formData = new FormData();
        formData.append("message", message);
        if (file) {
            formData.append("image", file);
        }
        if (replyingToMessage) {
            formData.append("replyTo", replyingToMessage._id);
        }

        try {
            const res = await axios.post(`${BASE_URL}/api/v1/message/send/${selectedUser?._id}`, formData, {
                withCredentials: true
            });
            dispatch(setMessages([...messages, res?.data?.newMessage]))
            dispatch(setReplyingToMessage(null));
        } catch (error) {
            console.log(error);
        }
        setMessage("");
        dispatch(setAiCompletion(""));
        dispatch(setAiSuggestions([]));
        setFile(null);
        setShowEmojiPicker(false);
    }

    const onEmojiClick = (emojiObject) => {
        setMessage(prev => prev + emojiObject.emoji);
        handleTyping({ target: { value: message + emojiObject.emoji } }); // Trigger typing for emoji
    };

    return (
        <form onSubmit={onSubmitHandler} className='px-4 my-3 relative flex flex-col'>
            {aiSuggestions && aiSuggestions.length > 0 && (
                <div className="flex gap-2 overflow-x-auto mb-2 pb-2">
                    {aiSuggestions.map((sug, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSuggestionClick(sug)}
                            className="bg-zinc-800 text-xs text-white px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-emerald-600 transition-colors border border-emerald-500/50"
                        >
                            {sug}
                        </button>
                    ))}
                </div>
            )}
            {replyingToMessage && (
                <div className="bg-zinc-800 rounded-t-lg p-3 text-sm border-l-4 border-emerald-500 flex justify-between items-start -mb-2 z-0 opacity-90 pb-4">
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="font-bold text-emerald-500 block mb-1">Replying to {replyingToMessage.senderId === authUser._id ? "yourself" : selectedUser.fullName}</span>
                        {replyingToMessage.message && <p className="text-gray-300 truncate">{replyingToMessage.message}</p>}
                        {replyingToMessage.image && <span className="italic text-gray-400">📷 Attachment</span>}
                    </div>
                    <button type="button" onClick={() => dispatch(setReplyingToMessage(null))} className="text-gray-400 hover:text-white p-1">
                        <IoClose size={20} />
                    </button>
                </div>
            )}
            {showEmojiPicker && (
                <div className='absolute bottom-16 left-4 z-50'>
                    <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
                </div>
            )}

            {file && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-700 rounded w-fit relative z-10">
                    {file.type.startsWith('audio/') ? (
                        <audio controls src={URL.createObjectURL(file)} className="h-10 w-48" />
                    ) : (
                        <img src={URL.createObjectURL(file)} alt="preview" className="h-16 w-16 object-cover rounded" />
                    )}
                    <button type="button" onClick={() => setFile(null)} className="text-red-500 text-sm hover:underline">Remove</button>
                </div>
            )}

            <div className='w-full flex items-center gap-1 bg-zinc-800/80 backdrop-blur-xl rounded-full shadow-lg border border-white/10 pr-4 pl-2 z-10 py-1'>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className='p-1.5 text-white hover:text-gray-300'>
                        <IoHappyOutline size={24} />
                    </button>

                    <label className='p-1.5 cursor-pointer text-white hover:text-gray-300'>
                        <IoAttachOutline size={24} />
                        <input type="file" accept="image/*,audio/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                    </label>

                    {isRecording ? (
                        <button type="button" onClick={stopRecording} className='p-1.5 text-red-500 hover:text-red-400 animate-pulse'>
                            <IoStopOutline size={24} />
                        </button>
                    ) : (
                        <button type="button" onClick={startRecording} className='p-1.5 text-white hover:text-gray-300'>
                            <IoMicOutline size={24} />
                        </button>
                    )}
                </div>

                <div className="relative w-full flex items-center">
                    <input
                        value={message}
                        onChange={handleTyping}
                        onKeyDown={acceptCompletion}
                        type="text"
                        placeholder='Send a message...'
                        className='border-none text-sm block w-full p-3 bg-transparent text-white outline-none z-10 relative'
                    />
                    {aiCompletion && message && (
                        <span className="absolute bottom-full left-0 mb-2 px-3 py-1.5 text-sm bg-zinc-700 text-emerald-400 rounded-lg shadow-lg pointer-events-none whitespace-nowrap">
                            {aiCompletion.startsWith(message) ? aiCompletion.slice(message.length) : aiCompletion}
                            <span className="ml-2 text-xs text-gray-400">(Press Tab)</span>
                            <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-zinc-700"></div>
                        </span>
                    )}
                </div>
                <button type="button" onClick={handleAiSuggest} disabled={isAiLoadingSuggestions} className='text-emerald-400 hover:text-emerald-300 ml-1 p-2 disabled:opacity-50' title="✨ AI Suggest">
                    <IoSparkles size={20} className={isAiLoadingSuggestions ? "animate-pulse" : ""} />
                </button>
                <button type="submit" className='text-white hover:text-gray-300 ml-1'>
                    <IoSend size={24} />
                </button>
            </div>
        </form>
    )
}

export default SendInput