import React, { useEffect } from 'react'
import Sidebar from './Sidebar'
import MessageContainer from './MessageContainer'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import useGetRealTimeMessage from '../hooks/useGetRealTimeMessage';

const HomePage = () => {
  const { authUser } = useSelector(store => store.user);
  const navigate = useNavigate();
  useGetRealTimeMessage();
  
  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { selectedUser } = useSelector(store => store.user);
  return (
    <div className='flex w-full h-[100dvh] md:h-[90vh] md:max-w-[1200px] md:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl bg-zinc-900/70 border-0 md:border border-white/10'>
      <div className={`w-full md:w-[350px] lg:w-[400px] flex-shrink-0 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <Sidebar />
      </div>
      <div className={`flex-1 w-full ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
        <MessageContainer />
      </div>
    </div>
  )
}

export default HomePage