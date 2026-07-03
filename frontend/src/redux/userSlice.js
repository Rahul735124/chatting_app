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
            const current = state.typingUserIds || [];
            if(!current.includes(userId)) {
                state.typingUserIds = [...current, userId];
            }
        },
        removeTypingUser:(state, action)=>{
            const userId = action.payload;
            const current = state.typingUserIds || [];
            state.typingUserIds = current.filter(id => id !== userId);
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
        },
        updateBlockedUsers:(state, action)=>{
            if(state.authUser){
                state.authUser.blockedUsers = action.payload;
            }
        },
        updateOtherUserBlockStatus:(state, action)=>{
            const { userId, isBlocked, myId } = action.payload;
            // Update in otherUsers list
            if(state.otherUsers){
                const userIndex = state.otherUsers.findIndex(u => u._id === userId);
                if(userIndex !== -1){
                    if(!state.otherUsers[userIndex].blockedUsers) {
                        state.otherUsers[userIndex].blockedUsers = [];
                    }
                    if(isBlocked) {
                        if(!state.otherUsers[userIndex].blockedUsers.includes(myId)) {
                            state.otherUsers[userIndex].blockedUsers.push(myId);
                        }
                    } else {
                        state.otherUsers[userIndex].blockedUsers = state.otherUsers[userIndex].blockedUsers.filter(id => id !== myId);
                    }
                }
            }
            // Update in selectedUser if currently selected
            if(state.selectedUser && state.selectedUser._id === userId) {
                if(!state.selectedUser.blockedUsers) {
                    state.selectedUser.blockedUsers = [];
                }
                if(isBlocked) {
                    if(!state.selectedUser.blockedUsers.includes(myId)) {
                        state.selectedUser.blockedUsers.push(myId);
                    }
                } else {
                    state.selectedUser.blockedUsers = state.selectedUser.blockedUsers.filter(id => id !== myId);
                }
            }
        }
    }
});
export const {setAuthUser,setOtherUsers,setSelectedUser,setOnlineUsers,incrementUnreadCount,clearUnreadCount,updateProfilePhoto,updateBlockedUsers,updateOtherUserBlockStatus,addTypingUser,removeTypingUser,updateLastSeen} = userSlice.actions;
export default userSlice.reducer;