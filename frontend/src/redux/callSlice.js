import { createSlice } from "@reduxjs/toolkit";

const callSlice = createSlice({
  name: "call",
  initialState: {
    isReceivingCall: false,
    callerInfo: null, // { from: userId, name: userName, signal: signalData }
    callAccepted: false,
    callEnded: false,
    isCalling: false, // when current user is calling someone
    callPartnerId: null, // the user being called or calling us
  },
  reducers: {
    setIncomingCall: (state, action) => {
      state.isReceivingCall = true;
      state.callerInfo = action.payload;
      state.callPartnerId = action.payload.from;
      state.callEnded = false;
      state.callAccepted = false;
    },
    setCallAccepted: (state, action) => {
      state.callAccepted = action.payload;
    },
    setCallEnded: (state, action) => {
      state.callEnded = action.payload;
      if (action.payload) {
        state.isReceivingCall = false;
        state.callerInfo = null;
        state.callAccepted = false;
        state.isCalling = false;
        state.callPartnerId = null;
      }
    },
    setIsCalling: (state, action) => {
      state.isCalling = true;
      state.callPartnerId = action.payload.partnerId;
      state.callEnded = false;
      state.callAccepted = false;
    },
    resetCallState: (state) => {
      state.isReceivingCall = false;
      state.callerInfo = null;
      state.callAccepted = false;
      state.callEnded = false;
      state.isCalling = false;
      state.callPartnerId = null;
    }
  }
});

export const { setIncomingCall, setCallAccepted, setCallEnded, setIsCalling, resetCallState } = callSlice.actions;
export default callSlice.reducer;
