import {createSlice} from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name:"message",
    initialState:{
        messages:null,
        replyingToMessage: null,
    },
    reducers:{
        setMessages:(state,action)=>{
            state.messages = action.payload;
        },
        removeMessages:(state,action)=>{
            const messageIds = action.payload;
            state.messages = state.messages.filter(msg => !messageIds.includes(msg._id));
        },
        censorMessages: (state, action) => {
            const messageIds = action.payload;
            state.messages = state.messages.map(msg => {
                if (messageIds.includes(msg._id)) {
                    return { ...msg, message: "🚫 This message was deleted", isDeleted: true };
                }
                return msg;
            });
        },
        markMessagesAsRead: (state, action) => {
            const receiverId = action.payload;
            state.messages = state.messages.map(msg => {
                if (msg.receiverId === receiverId) {
                    return { ...msg, isRead: true };
                }
                return msg;
            });
        },
        updateMessageReaction: (state, action) => {
            const updatedMessage = action.payload;
            state.messages = state.messages.map(msg => 
                msg._id === updatedMessage._id ? updatedMessage : msg
            );
        },
        setReplyingToMessage: (state, action) => {
            state.replyingToMessage = action.payload;
        }
    }
});
export const {setMessages, removeMessages, censorMessages, markMessagesAsRead, updateMessageReaction, setReplyingToMessage} = messageSlice.actions;
export default messageSlice.reducer;