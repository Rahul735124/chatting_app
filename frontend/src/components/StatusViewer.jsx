import React, { useEffect, useState } from 'react';
import { IoClose, IoEye, IoTrash } from 'react-icons/io5';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '..';
import { deleteMyStatus } from '../redux/statusSlice';
import toast from 'react-hot-toast';

const StatusViewer = ({ group, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showViewers, setShowViewers] = useState(false);
    const statuses = group.statuses;
    const { authUser } = useSelector(store => store.user);
    const dispatch = useDispatch();

    const isMyStatus = authUser && group.user._id === authUser._id;

    const handleDeleteStatus = async (e) => {
        e.stopPropagation();
        try {
            const statusId = statuses[currentIndex]._id;
            const res = await axios.delete(`${BASE_URL}/api/v1/status/${statusId}`, {
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(deleteMyStatus(statusId));
                toast.success("Status deleted");
                // If it was the last status in the group, close viewer. Else it will auto adjust.
                if (statuses.length === 1) {
                    onClose();
                } else if (currentIndex === statuses.length - 1) {
                    setCurrentIndex(prev => prev - 1);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete status");
        }
    }

    // Auto-advance and mark viewed
    useEffect(() => {
        // Mark as viewed
        const markViewed = async () => {
            if (!isMyStatus) {
                try {
                    await axios.post(`${BASE_URL}/api/v1/status/view/${statuses[currentIndex]._id}`, {}, {
                        withCredentials: true
                    });
                } catch (error) {
                    console.log("Error marking status viewed", error);
                }
            }
        };
        markViewed();

        // Timer to advance
        if (!showViewers) {
            const timer = setTimeout(() => {
                if (currentIndex < statuses.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    onClose();
                }
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, statuses, isMyStatus, onClose, showViewers]);

    const handleNext = (e) => {
        e.stopPropagation();
        if (currentIndex < statuses.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center">
            {/* Top Bar */}
            <div className="absolute top-0 w-full p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/70 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-gray-500 overflow-hidden">
                        <img src={group.user.profilePhoto} alt="user" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-white font-semibold">
                        {isMyStatus ? "My Status" : group.user.fullName}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isMyStatus && (
                        <button onClick={handleDeleteStatus} className="text-red-500 hover:text-red-400 mr-2 bg-black/40 p-2 rounded-full">
                            <IoTrash size={24} />
                        </button>
                    )}
                    <button onClick={onClose} className="text-white hover:text-gray-300">
                        <IoClose size={32} />
                    </button>
                </div>
            </div>

            {/* Progress Bars */}
            <div className="absolute top-2 w-full flex gap-1 px-2 z-10">
                {statuses.map((_, idx) => (
                    <div key={idx} className="h-1 flex-1 bg-gray-600 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-white transition-all ease-linear"
                            style={{
                                width: idx < currentIndex ? '100%' : (idx === currentIndex && !showViewers ? '100%' : '0%'),
                                transition: idx === currentIndex && !showViewers ? 'width 5s linear' : 'none',
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Clickable Navigation Areas (Disabled if viewers modal is open) */}
            {!showViewers && (
                <div className="absolute inset-0 z-0 flex">
                    <div className="w-1/2 h-full cursor-pointer" onClick={handlePrev}></div>
                    <div className="w-1/2 h-full cursor-pointer" onClick={handleNext}></div>
                </div>
            )}

            {/* Image */}
            <img 
                src={statuses[currentIndex].imageUrl} 
                alt="status" 
                className={`max-w-full max-h-screen object-contain pointer-events-none transition-opacity ${showViewers ? 'opacity-30' : 'opacity-100'}`}
            />

            {/* Viewers UI (Only for my own status) */}
            {isMyStatus && (
                <div className="absolute bottom-6 w-full flex justify-center z-20">
                    <button 
                        onClick={() => setShowViewers(true)}
                        className="flex items-center gap-2 bg-black/60 hover:bg-black/80 px-4 py-2 rounded-full text-white backdrop-blur-sm transition-all"
                    >
                        <IoEye size={20} />
                        <span className="font-semibold">{statuses[currentIndex].viewers?.length || 0}</span>
                    </button>
                </div>
            )}

            {/* Viewers Modal */}
            {showViewers && (
                <div className="absolute bottom-0 w-full max-w-md bg-zinc-900 rounded-t-3xl shadow-2xl z-30 flex flex-col max-h-[60vh] overflow-hidden transition-transform animate-slideUp">
                    <div className="flex justify-between items-center p-4 border-b border-zinc-700">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <IoEye /> Viewed by {statuses[currentIndex].viewers?.length || 0}
                        </h3>
                        <button onClick={() => setShowViewers(false)} className="text-gray-400 hover:text-white">
                            <IoClose size={24} />
                        </button>
                    </div>
                    <div className="overflow-y-auto p-4 flex flex-col gap-4">
                        {!statuses[currentIndex].viewers || statuses[currentIndex].viewers.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No views yet.</p>
                        ) : (
                            statuses[currentIndex].viewers.map((viewer, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="avatar">
                                        <div className="w-12 h-12 rounded-full">
                                            <img src={viewer.profilePhoto} alt="viewer" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium">{viewer.fullName}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slideUp {
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default StatusViewer;
