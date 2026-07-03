import {createSlice} from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name:"message",
    initialState:{
        messages:null,
        replyingToMessage: null,
        aiSuggestions: [],
        isAiLoading: false,
        aiCompletion: "",
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
        },
        setAiSuggestions: (state, action) => {
            state.aiSuggestions = action.payload;
        },
        setIsAiLoading: (state, action) => {
            state.isAiLoading = action.payload;
        },
        setAiCompletion: (state, action) => {
            state.aiCompletion = action.payload;
        }
    }
});
export const {setMessages, removeMessages, censorMessages, markMessagesAsRead, updateMessageReaction, setReplyingToMessage, setAiSuggestions, setIsAiLoading, setAiCompletion} = messageSlice.actions;
export default messageSlice.reducer;