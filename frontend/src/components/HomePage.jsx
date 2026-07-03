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
    <div className='flex w-full h-screen sm:max-w-[90vw] md:w-auto sm:h-[450px] md:h-[550px] sm:rounded-lg overflow-hidden bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
      <div className={`w-full md:w-auto ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <Sidebar />
      </div>
      <div className={`w-full md:w-auto ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
        <MessageContainer />
      </div>
    </div>
  )
}

export default HomePage