import React, { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { setAuthUser, setOtherUsers, setSelectedUser, updateProfilePhoto } from '../redux/userSlice';
import { setMessages } from '../redux/messageSlice';
import { BASE_URL } from '..';
import { IoCamera } from 'react-icons/io5';

const ProfileModal = () => {
    const { authUser } = useSelector(store => store.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/v1/user/logout`);
            localStorage.removeItem("token");
            navigate("/login");
            toast.success(res.data.message);
            dispatch(setAuthUser(null));
            dispatch(setMessages(null));
            dispatch(setOtherUsers(null));
            dispatch(setSelectedUser(null));
            document.getElementById('profile_modal').close();
        } catch (error) {
            console.log(error);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("profilePhoto", file);

        try {
            const res = await axios.post(`${BASE_URL}/api/v1/user/update-profile`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            
            if (res.data.success) {
                dispatch(updateProfilePhoto(res.data.user.profilePhoto));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error("Failed to update profile photo");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog id="profile_modal" className="modal">
            <div className="modal-box bg-zinc-800 text-white rounded-lg max-w-sm">
                <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                
                <h3 className="font-bold text-lg text-center mb-6">Profile Settings</h3>
                
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className={`avatar ${loading ? 'opacity-50' : ''}`}>
                            <div className="w-32 rounded-full border-4 border-zinc-600 group-hover:border-zinc-400 transition-colors">
                                <img src={authUser?.profilePhoto} alt="profile" />
                            </div>
                        </div>
                        {/* Overlay icon on hover */}
                        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all">
                            <IoCamera className="text-white opacity-0 group-hover:opacity-100 text-3xl" />
                        </div>
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="loading loading-spinner loading-md text-white"></span>
                            </div>
                        )}
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handlePhotoChange} 
                    />

                    <div className="text-center">
                        <h2 className="text-xl font-semibold">{authUser?.fullName}</h2>
                        <p className="text-gray-400 text-sm">@{authUser?.username}</p>
                    </div>

                    <div className="w-full divider my-2 border-zinc-600"></div>

                    <button 
                        onClick={logoutHandler} 
                        className="btn btn-error w-full text-white"
                    >
                        Log out
                    </button>
                </div>
            </div>
            
            {/* Click outside to close */}
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
};

export default ProfileModal;
