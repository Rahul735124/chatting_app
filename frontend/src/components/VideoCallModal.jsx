import React, { useEffect, useState } from 'react';
import { useVideoCall } from '../hooks/useVideoCall';
import { IoCall, IoClose, IoMic, IoMicOff, IoVolumeHigh, IoVolumeMute } from 'react-icons/io5';
import { MdCallEnd } from 'react-icons/md';
import { useSelector } from 'react-redux';

const VideoCallModal = () => {
    const {
        answerCall,
        endCall,
        switchCamera,
        myVideo,
        userVideo,
        localStream,
        remoteStream,
        isReceivingCall,
        callerInfo,
        callAccepted,
        isCalling,
        callType
    } = useVideoCall();

    const { selectedUser } = useSelector(store => store.user);

    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);

    const toggleMute = () => {
        if (localStream && localStream.getAudioTracks().length > 0) {
            const audioTrack = localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }
    };

    const toggleSpeaker = () => {
        if (userVideo.current) {
            userVideo.current.muted = isSpeakerOn; // If speaker is on, we are turning it off (muting)
            setIsSpeakerOn(!isSpeakerOn);
        }
    };

    // Auto-play streams when available
    useEffect(() => {
        if (remoteStream && userVideo.current) {
            userVideo.current.srcObject = remoteStream;
            userVideo.current.play().catch(e => console.error("Remote video play error:", e));
        }
        if (localStream && myVideo.current) {
            myVideo.current.srcObject = localStream;
            myVideo.current.play().catch(e => console.error("Local video play error:", e));
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
                    <h2 className="text-white text-xl font-semibold">
                        {callerInfo?.name} {callType === 'audio' ? 'is calling (Audio)...' : 'is video calling...'}
                    </h2>
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
            <div className="fixed inset-0 z-[100] bg-zinc-900 flex flex-col" onDoubleClick={switchCamera}>
                <div className="relative flex-1 w-full h-full">
                    {/* Remote Video or Audio Avatar (Full Screen) */}
                    {callAccepted ? (
                        <div className="w-full h-full relative bg-zinc-900">
                            <video
                                playsInline
                                ref={userVideo}
                                autoPlay
                                className={`w-full h-full object-cover ${callType === 'audio' ? 'hidden' : ''}`}
                            />
                            {callType === 'audio' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800 z-10">
                                    <div className="avatar placeholder mb-4 animate-pulse">
                                        <div className="bg-neutral text-neutral-content rounded-full w-32 h-32 md:w-48 md:h-48">
                                            <span className="text-5xl">{selectedUser?.fullName?.charAt(0) || callerInfo?.name?.charAt(0)}</span>
                                        </div>
                                    </div>
                                    <h2 className="text-white text-2xl font-semibold">{selectedUser?.fullName || callerInfo?.name}</h2>
                                    <p className="text-green-400 mt-2">Audio Call</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-2xl">
                            Calling {selectedUser?.fullName || callerInfo?.name || "User"}...
                        </div>
                    )}

                    {/* Local Video (Floating bottom right) */}
                    {localStream && callType !== 'audio' && (
                        <div className="absolute bottom-24 right-4 w-32 h-48 md:w-48 md:h-72 bg-zinc-800 rounded-xl overflow-hidden shadow-2xl border-2 border-zinc-700 z-20">
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
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 bg-zinc-900/60 px-4 md:px-6 py-2 md:py-3 rounded-full backdrop-blur-md border border-white/10 w-[90%] md:w-auto justify-center z-50">
                        <button onClick={toggleMute} className={`btn btn-sm md:btn-md btn-circle ${isMuted ? 'btn-error' : 'btn-ghost text-white hover:bg-zinc-700'}`}>
                            {isMuted ? <IoMicOff size={20} className="md:w-6 md:h-6" /> : <IoMic size={20} className="md:w-6 md:h-6" />}
                        </button>
                        
                        <button onClick={endCall} className="btn btn-sm md:btn-md btn-error text-white shadow-lg shadow-red-500/50 px-4 md:px-8 py-0 rounded-full text-sm md:text-lg font-semibold flex items-center gap-1 md:gap-2">
                            <MdCallEnd size={20} className="md:w-7 md:h-7" /> 
                            <span className="whitespace-nowrap">Hang Up</span>
                        </button>

                        <button onClick={toggleSpeaker} className={`btn btn-sm md:btn-md btn-circle ${!isSpeakerOn ? 'btn-error' : 'btn-ghost text-white hover:bg-zinc-700'}`}>
                            {!isSpeakerOn ? <IoVolumeMute size={20} className="md:w-6 md:h-6" /> : <IoVolumeHigh size={20} className="md:w-6 md:h-6" />}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default VideoCallModal;
