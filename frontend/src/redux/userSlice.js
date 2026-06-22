import {createSlice} from "@reduxjs/toolkit";

const userSlice = createSlice({
    name:"user",
    initialState:{
        authUser:null,
        otherUsers:null,
        selectedUser:null,
        onlineUsers:null,
        typingUserIds: [], // array of user IDs currently typing
    },
    reducers:{
        setAuthUser:(state,action)=>{
            state.authUser = action.payload;
        },
        setOtherUsers:(state, action)=>{
            state.otherUsers = action.payload;
        },
        setSelectedUser:(state,action)=>{
            state.selectedUser = action.payload;
        },
        setOnlineUsers:(state,action)=>{
            state.onlineUsers = action.payload;
        },
        addTypingUser:(state, action)=>{
            const userId = action.payload;
            if(!state.typingUserIds) {
                state.typingUserIds = [];
            }
            if(!state.typingUserIds.includes(userId)) {
                state.typingUserIds.push(userId);
            }
        },
        removeTypingUser:(state, action)=>{
            const userId = action.payload;
            if(state.typingUserIds) {
                state.typingUserIds = state.typingUserIds.filter(id => id !== userId);
            }
        },
        updateLastSeen:(state, action)=>{
            const { userId, lastSeen } = action.payload;
            if(state.otherUsers){
                const userIndex = state.otherUsers.findIndex(u => u._id === userId);
                if(userIndex !== -1){
                    state.otherUsers[userIndex].lastSeen = lastSeen;
                }
            }
            if(state.selectedUser && state.selectedUser._id === userId) {
                state.selectedUser.lastSeen = lastSeen;
            }
        },
        incrementUnreadCount:(state, action)=>{
            const userId = action.payload;
            if(state.otherUsers){
                const userIndex = state.otherUsers.findIndex(u => u._id === userId);
                if(userIndex !== -1){
                    state.otherUsers[userIndex].unreadCount = (state.otherUsers[userIndex].unreadCount || 0) + 1;
                }
            }
        },
        clearUnreadCount:(state, action)=>{
            const userId = action.payload;
            if(state.otherUsers){
                const userIndex = state.otherUsers.findIndex(u => u._id === userId);
                if(userIndex !== -1){
                    state.otherUsers[userIndex].unreadCount = 0;
                }
            }
        },
        updateProfilePhoto:(state, action)=>{
            if(state.authUser){
                state.authUser.profilePhoto = action.payload;
            }
        }
    }
});
export const {setAuthUser,setOtherUsers,setSelectedUser,setOnlineUsers,incrementUnreadCount,clearUnreadCount,updateProfilePhoto,addTypingUser,removeTypingUser,updateLastSeen} = userSlice.actions;
export default userSlice.reducer;