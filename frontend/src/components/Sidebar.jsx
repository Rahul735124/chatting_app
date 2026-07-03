import React, { useState } from 'react'
import { BiSearchAlt2 } from "react-icons/bi";
import OtherUsers from './OtherUsers';
import toast from "react-hot-toast";
import {useSelector, useDispatch} from "react-redux";
import { setOtherUsers } from '../redux/userSlice';
import ProfileModal from './ProfileModal';
import StatusBar from './StatusBar';
import useGetStatuses from '../hooks/useGetStatuses';
import useRealTimeStatus from '../hooks/useRealTimeStatus';

const Sidebar = () => {
    useGetStatuses(); // Fetch statuses when sidebar loads
    useRealTimeStatus(); // Listen for real-time status updates

    const [search, setSearch] = useState("");
    const {otherUsers} = useSelector(store=>store.user);
    const dispatch = useDispatch();
    const {authUser} = useSelector(store=>store.user);

    const searchSubmitHandler = (e) => {
        e.preventDefault();
        const conversationUser = otherUsers?.find((user)=> user.fullName.toLowerCase().includes(search.toLowerCase()));
        if(conversationUser){
            dispatch(setOtherUsers([conversationUser]));
        }else{
            toast.error("User not found!");
        }
    }
    
    return (
        <div className='w-full h-full border-none md:border-r border-white/10 p-4 flex flex-col bg-zinc-900/40 md:bg-transparent'>
            
            {/* Top Header Section (Status Bar + Profile Menu) */}
            <div className="flex justify-between items-center mb-4 gap-2">
                {/* Status Bar takes up remaining width and scrolls horizontally */}
                <div className="flex-1 overflow-hidden">
                    <StatusBar />
                </div>
                
                {/* Profile/Menu Button on the far right */}
                <button 
                    onClick={() => document.getElementById('profile_modal').showModal()}
                    className="btn btn-circle btn-ghost text-white mb-6"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
            </div>

            {/* Mobile-only greeting */}
            <div className="md:hidden mb-4 text-center">
                <h1 className='text-2xl text-white font-bold'>Hi, {authUser?.fullName}</h1>
                <p className='text-sm text-gray-300'>Let's start conversation</p>
            </div>

            <form onSubmit={searchSubmitHandler} action="" className='flex items-center gap-2 mt-2'>
                <input
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                    className='input input-bordered rounded-md' type="text"
                    placeholder='Search...'
                />
                <button type='submit' className='btn bg-zinc-700 text-white'>
                    <BiSearchAlt2 className='w-6 h-6 outline-none'/>
                </button>
            </form>
            <div className="divider px-3"></div> 
            <OtherUsers/> 
            
            <ProfileModal />
        </div>
    )
}

export default Sidebar