import { createSlice } from "@reduxjs/toolkit";

const statusSlice = createSlice({
    name: "status",
    initialState: {
        allStatuses: null, // Array of grouped statuses
    },
    reducers: {
        setAllStatuses: (state, action) => {
            state.allStatuses = action.payload;
        },
        addMyStatus: (state, action) => {
            if (!state.allStatuses) {
                state.allStatuses = [action.payload];
            } else {
                // If I already have a status group, append to it. Else, push new group.
                const myGroupIndex = state.allStatuses.findIndex(group => group.user._id === action.payload.user._id);
                if (myGroupIndex !== -1) {
                    state.allStatuses[myGroupIndex].statuses.unshift(...action.payload.statuses);
                } else {
                    state.allStatuses.unshift(action.payload);
                }
            }
        },
        deleteMyStatus: (state, action) => {
            const statusId = action.payload;
            if (state.allStatuses) {
                // Find my group and remove the status
                for (let i = 0; i < state.allStatuses.length; i++) {
                    const group = state.allStatuses[i];
                    const index = group.statuses.findIndex(s => s._id === statusId);
                    if (index !== -1) {
                        group.statuses.splice(index, 1);
                        // If group is empty, remove the group
                        if (group.statuses.length === 0) {
                            state.allStatuses.splice(i, 1);
                        }
                        break;
                    }
                }
            }
        },
        updateStatusViewers: (state, action) => {
            const { statusId, viewers } = action.payload;
            if (state.allStatuses) {
                for (let group of state.allStatuses) {
                    const status = group.statuses.find(s => s._id === statusId);
                    if (status) {
                        status.viewers = viewers;
                        break;
                    }
                }
            }
        }
    }
});

export const { setAllStatuses, addMyStatus, deleteMyStatus, updateStatusViewers } = statusSlice.actions;
export default statusSlice.reducer;
