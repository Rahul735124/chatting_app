import React from 'react'
import { useDispatch,useSelector } from "react-redux";
import { setSelectedUser, clearUnreadCount } from '../redux/userSlice';
import axios from 'axios';
import { BASE_URL } from '..';

const OtherUser = ({ user }) => {
    const dispatch = useDispatch();
    const {selectedUser, onlineUsers} = useSelector(store=>store.user);
    const isOnline = onlineUsers?.includes(user._id);
    
    const selectedUserHandler = async (user) => {
        dispatch(setSelectedUser(user));
        if (user.unreadCount > 0) {
            try {
                await axios.post(`${BASE_URL}/api/v1/message/mark-read/${user._id}`, {}, { withCredentials: true });
                dispatch(clearUnreadCount(user._id));
            } catch (error) {
                console.log(error);
            }
        }
    }
    return (
        <>
            <div onClick={() => selectedUserHandler(user)} className={` ${selectedUser?._id === user?._id ? 'bg-zinc-200 text-black' : 'text-white'} flex gap-2 hover:text-black items-center hover:bg-zinc-200 rounded p-2 cursor-pointer relative`}>
                <div className={`avatar ${isOnline ? 'online' : '' }`}>
                    <div className='w-12 rounded-full'>
                        <img src={user?.profilePhoto} alt="user-profile" />
                    </div>
                </div>
                <div className='flex flex-col flex-1'>
                    <div className='flex justify-between gap-2 items-center'>
                        <p>{user?.fullName}</p>
                        {user.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {user.unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className='divider my-0 py-0 h-1'></div>
        </>
    )
}

export default OtherUser