import React, { useEffect } from 'react';
import { useVideoCall } from '../hooks/useVideoCall';
import { IoCall, IoClose } from 'react-icons/io5';
import { MdCallEnd } from 'react-icons/md';
import { useSelector } from 'react-redux';

const VideoCallModal = () => {
    const {
        answerCall,
        endCall,
        myVideo,
        userVideo,
        localStream,
        remoteStream,
        isReceivingCall,
        callerInfo,
        callAccepted,
        isCalling
    } = useVideoCall();

    const { selectedUser } = useSelector(store => store.user);

    // Auto-play streams when available
    useEffect(() => {
        if (remoteStream && userVideo.current) {
            userVideo.current.srcObject = remoteStream;
        }
        if (localStream && myVideo.current) {
            myVideo.current.srcObject = localStream;
        }
    }, [remoteStream, localStream, callAccepted, isCalling, userVideo, myVideo]);

    const isActiveCall = callAccepted || isCalling;

    // 1. If receiving a call and haven't accepted yet
    if (isReceivingCall && !callAccepted) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <audio src="https://assets.mixkit.co/active_storage/sfx/1354/1354-preview.mp3" autoPlay loop />
                <div className="bg-zinc-800 p-8 rounded-2xl flex flex-col items-center gap-4 animate-bounce">
                    <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-24">
                            <span className="text-3xl">{callerInfo?.name?.charAt(0)}</span>
                        </div>
                    </div>
                    <h2 className="text-white text-xl font-semibold">{callerInfo?.name} is calling...</h2>
                    <div className="flex gap-4 mt-4">
                        <button onClick={answerCall} className="btn btn-success btn-circle btn-lg text-white">
                            <IoCall size={28} />
                        </button>
                        <button onClick={endCall} className="btn btn-error btn-circle btn-lg text-white">
                            <IoClose size={28} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. If in an active call (or calling someone)
    if (isActiveCall) {
        return (
            <div className="fixed inset-0 z-[100] bg-zinc-900 flex flex-col">
                <div className="relative flex-1 w-full h-full">
                    {/* Remote Video (Full Screen) */}
                    {callAccepted ? (
                        <video
                            playsInline
                            ref={userVideo}
                            autoPlay
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-2xl">
                            Calling {selectedUser?.fullName || "User"}...
                        </div>
                    )}

                    {/* Local Video (Floating bottom right) */}
                    {localStream && (
                        <div className="absolute bottom-24 right-4 w-32 h-48 md:w-48 md:h-72 bg-zinc-800 rounded-xl overflow-hidden shadow-2xl border-2 border-zinc-700">
                            <video
                                playsInline
                                muted
                                ref={myVideo}
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Controls */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
                        <button onClick={endCall} className="btn btn-error text-white shadow-lg shadow-red-500/50 px-8 py-3 rounded-full text-lg font-semibold flex items-center gap-2">
                            <MdCallEnd size={28} /> Hang Up
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default VideoCallModal;
