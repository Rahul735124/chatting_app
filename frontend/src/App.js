import Signup from './components/Signup';
import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from './components/HomePage';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import { useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";
import { setSocket } from './redux/socketSlice';
import { setOnlineUsers } from './redux/userSlice';
import { BASE_URL } from '.';
import VideoCallModal from './components/VideoCallModal';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />
  },
])

function App() {
  const { authUser } = useSelector(store => store.user);
  const { socket } = useSelector(store => store.socket);
  const dispatch = useDispatch();

  useEffect(() => {
    if (authUser) {
      // IMPORTANT FIX
      const socketio = io(BASE_URL, {
        withCredentials: true,
        transports: ["websocket"],   // Force websocket
        query: {
          userId: authUser._id
        }
      });

      dispatch(setSocket(socketio));

      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      return () => socketio.close();

    } else {
      if (socket) {
        socket.close();
        dispatch(setSocket(null));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  return (
    <div className="p-0 md:p-4 h-screen flex items-center justify-center">
      <RouterProvider router={router} />
      <VideoCallModal />
    </div>
  );
}

export default App;
