import { useEffect } from "react";
import {useSelector, useDispatch} from "react-redux";
import { setMessages, censorMessages, markMessagesAsRead, updateMessageReaction } from "../redux/messageSlice";
import { incrementUnreadCount, addTypingUser, removeTypingUser, updateLastSeen } from "../redux/userSlice";

const useGetRealTimeMessage = () => {
    const {socket} = useSelector(store=>store.socket);
    const {messages} = useSelector(store=>store.message);
    const {selectedUser} = useSelector(store=>store.user);
    const dispatch = useDispatch();

    useEffect(()=>{
        socket?.on("newMessage", (newMessage)=>{
            if(selectedUser?._id?.toString() === newMessage?.senderId?.toString()){
                const currentMessages = Array.isArray(messages) ? messages : [];
                dispatch(setMessages([...currentMessages, newMessage]));
            } else {
                dispatch(incrementUnreadCount(newMessage?.senderId?.toString()));
            }
        });

        socket?.on("messagesDeleted", (messageIds) => {
            dispatch(censorMessages(messageIds));
        });

        socket?.on("typing", (userId) => {
            dispatch(addTypingUser(userId));
        });

        socket?.on("stopTyping", (userId) => {
            dispatch(removeTypingUser(userId));
        });

        socket?.on("lastSeenUpdate", (data) => {
            dispatch(updateLastSeen(data));
        });

        socket?.on("messagesRead", ({ receiverId }) => {
            dispatch(markMessagesAsRead(receiverId));
        });

        socket?.on("messageReacted", (updatedMessage) => {
            dispatch(updateMessageReaction(updatedMessage));
        });

        return () => {
            socket?.off("newMessage");
            socket?.off("messagesDeleted");
            socket?.off("typing");
            socket?.off("stopTyping");
            socket?.off("lastSeenUpdate");
            socket?.off("messagesRead");
            socket?.off("messageReacted");
        }
    },[messages, selectedUser, socket, dispatch]);
};
export default useGetRealTimeMessage;