import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIncomingCall, setCallAccepted, setCallEnded, resetCallState, setIsCalling, setInitiateCallTo } from '../redux/callSlice';
import toast from 'react-hot-toast';

export const useVideoCall = () => {
    const dispatch = useDispatch();
    const { socket } = useSelector((store) => store.socket);
    const { authUser } = useSelector((store) => store.user);
    const { isReceivingCall, callerInfo, callAccepted, callEnded, isCalling, callPartnerId, initiateCallTo } = useSelector((store) => store.call);

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const pendingCandidates = useRef([]);

    useEffect(() => {
        if (!socket) return;

        socket.on("callUser", (data) => {
            if (isReceivingCall || isCalling || callAccepted) {
                // If already in a call, we could send a busy signal, but for now ignore
                return;
            }
            dispatch(setIncomingCall({ from: data.from, name: data.name, signal: data.signal }));
        });

        socket.on("callAccepted", async (signal) => {
            dispatch(setCallAccepted(true));
            try {
                if (connectionRef.current) {
                    await connectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
                    for (const candidate of pendingCandidates.current) {
                        await connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                    pendingCandidates.current = [];
                }
            } catch (err) {
                console.error("Error setting remote description on accept:", err);
            }
        });

        socket.on("iceCandidate", async (candidate) => {
            try {
                if (connectionRef.current && connectionRef.current.remoteDescription) {
                    await connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } else {
                    pendingCandidates.current.push(candidate);
                }
            } catch (err) {
                console.error("Error adding ice candidate:", err);
            }
        });

        socket.on("endCall", () => {
            handleEndCall(false); // false means we didn't initiate the end
        });

        return () => {
            socket.off("callUser");
            socket.off("callAccepted");
            socket.off("iceCandidate");
            socket.off("endCall");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, isReceivingCall, isCalling, callAccepted, dispatch]);

    useEffect(() => {
        if (initiateCallTo) {
            callUser(initiateCallTo);
            dispatch(setInitiateCallTo(null));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initiateCallTo, dispatch]);

    const initMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (myVideo.current) {
                myVideo.current.srcObject = stream;
            }
            return stream;
        } catch (error) {
            console.error("Failed to get media devices:", error);
            toast.error("Please allow camera and microphone permissions to continue.");
            return null;
        }
    };

    const callUser = async (userToCall) => {
        const stream = await initMedia();
        if (!stream) {
            dispatch(resetCallState());
            return;
        }

        dispatch(setIsCalling({ partnerId: userToCall }));

        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        });

        connectionRef.current = peer;

        stream.getTracks().forEach((track) => {
            peer.addTrack(track, stream);
        });

        peer.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("iceCandidate", { to: userToCall, candidate: event.candidate });
            }
        };

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit("callUser", {
            userToCall,
            signalData: offer,
            from: authUser._id,
            name: authUser.fullName,
        });
    };

    const answerCall = async () => {
        const stream = await initMedia();
        if (!stream) {
            handleEndCall(true);
            return;
        }

        dispatch(setCallAccepted(true));

        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        });

        connectionRef.current = peer;

        stream.getTracks().forEach((track) => {
            peer.addTrack(track, stream);
        });

        peer.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("iceCandidate", { to: callerInfo.from, candidate: event.candidate });
            }
        };

        await peer.setRemoteDescription(new RTCSessionDescription(callerInfo.signal));
        
        for (const candidate of pendingCandidates.current) {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidates.current = [];

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("answerCall", { signal: answer, to: callerInfo.from });
    };

    const handleEndCall = (emit = true) => {
        // Stop tracks from the video element directly BEFORE state changes unmount it
        if (myVideo.current && myVideo.current.srcObject) {
            myVideo.current.srcObject.getTracks().forEach(track => track.stop());
            myVideo.current.srcObject = null;
        }

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        
        setRemoteStream(null);
        if (userVideo.current) {
             userVideo.current.srcObject = null;
        }

        dispatch(setCallEnded(true));
        
        const partner = callPartnerId || callerInfo?.from;
        if (emit && partner) {
            socket.emit("endCall", { to: partner });
        }
        
        if (connectionRef.current) {
            connectionRef.current.close();
            connectionRef.current = null;
        }
        
        pendingCandidates.current = [];

        dispatch(resetCallState());
    };

    return {
        callUser,
        answerCall,
        endCall: () => handleEndCall(true),
        myVideo,
        userVideo,
        localStream,
        remoteStream,
        isReceivingCall,
        callerInfo,
        callAccepted,
        callEnded,
        isCalling,
        callPartnerId
    };
};
