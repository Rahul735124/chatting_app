import React, { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { addMyStatus } from '../redux/statusSlice';
import { BASE_URL } from '..';
import { IoAdd } from 'react-icons/io5';
import StatusViewer from './StatusViewer';

const StatusBar = () => {
    const { authUser } = useSelector(store => store.user);
    const { allStatuses } = useSelector(store => store.status);
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    // For Status Viewer
    const [viewerOpen, setViewerOpen] = useState(false);
    const [activeStatusGroupId, setActiveStatusGroupId] = useState(null);

    const activeStatusGroup = allStatuses?.find(group => group.user._id === activeStatusGroupId);

    const handleStatusUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await axios.post(`${BASE_URL}/api/v1/status/upload`, formData, {
                withCredentials: true
            });

            if (res.data.success) {
                // We create a mock group to add to Redux locally
                const newStatusGroup = {
                    user: {
                        _id: authUser._id,
                        fullName: authUser.fullName,
                        profilePhoto: authUser.profilePhoto,
                        username: authUser.username
                    },
                    statuses: [res.data.status]
                };
                dispatch(addMyStatus(newStatusGroup));
                toast.success("Status uploaded!");
            }
        } catch (error) {
            toast.error("Failed to upload status");
            console.log(error);
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = null; // reset input
        }
    };

    const openViewer = (group) => {
        setActiveStatusGroupId(group.user._id);
        setViewerOpen(true);
    };

    const closeViewer = () => {
        setViewerOpen(false);
        setActiveStatusGroupId(null);
    };

    return (
        <div className="w-full">
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 items-center">

                {/* My Status Button */}
                <div className="flex flex-col items-center gap-1 min-w-max cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
                    <div className={`avatar ${loading ? 'opacity-50' : ''}`}>
                        <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-400 p-0.5">
                            <img src={authUser?.profilePhoto} alt="my status" className="rounded-full" />
                        </div>
                    </div>
                    {/* Tiny Plus Icon */}
                    <div className="absolute bottom-5 right-0 bg-green-500 rounded-full p-0.5 border-2 border-zinc-800">
                        <IoAdd className="text-white text-sm font-bold" />
                    </div>
                    <span className="text-xs text-gray-300">My Status</span>

                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center top-[-20px]">
                            <span className="loading loading-spinner loading-sm text-white"></span>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleStatusUpload}
                />

                {/* Other Users Statuses */}
                {allStatuses && allStatuses.map((group, idx) => (
                    // Don't show my own status here, I already have "My Status" at the front. 
                    // Or actually, if I want to view my own status, I should be able to.
                    // For WhatsApp style: My Status is at the front. Clicking it views it if it exists, but the "+" uploads.
                    // To keep it simple: We'll show all users who uploaded statuses. If I am in the list, I can view my own.
                    <div
                        key={idx}
                        className="flex flex-col items-center gap-1 min-w-max cursor-pointer"
                        onClick={() => openViewer(group)}
                    >
                        <div className="avatar">
                            {/* Green ring indicating active status */}
                            <div className="w-14 h-14 rounded-full border-[3px] border-green-500 p-0.5">
                                <img src={group.user.profilePhoto} alt="status" className="rounded-full" />
                            </div>
                        </div>
                        <span className="text-xs text-gray-300">
                            {group.user._id === authUser?._id ? "You" : group.user.fullName.split(" ")[0]}
                        </span>
                    </div>
                ))}
            </div>

            {/* Status Viewer Modal */}
            {viewerOpen && activeStatusGroup && (
                <StatusViewer group={activeStatusGroup} onClose={closeViewer} />
            )}
        </div>
    );
};

export default StatusBar;
