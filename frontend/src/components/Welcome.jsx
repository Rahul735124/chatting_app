import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoLockClosed, IoPeople, IoFlash, IoChevronUp } from 'react-icons/io5';

const Welcome = () => {
    const navigate = useNavigate();
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Minimum distance required for a swipe
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientY);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientY);
    };

    const onTouchEndHandler = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isUpSwipe = distance > minSwipeDistance;
        
        if (isUpSwipe) {
            navigate('/login');
        }
    };

    const handleWheel = (e) => {
        if (e.deltaY > 50) {
            navigate('/login');
        }
    };

    return (
        <div 
            className="w-full min-h-[100dvh] bg-[#06001a] text-white flex flex-col items-center justify-between py-6 relative overflow-y-auto overflow-x-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEndHandler}
            onWheel={handleWheel}
        >
            {/* Background elements to mimic the poster's wavy/glow look */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/30 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/30 blur-[120px] rounded-full"></div>
            </div>

            <div className="z-10 flex flex-col items-center h-full w-full max-w-md px-6">
                
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-2 mt-4">
                    <img src="/logo.png" alt="Logo" className="w-40 h-auto drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]" onError={(e) => e.target.style.display = 'none'} />
                </div>

                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold mb-1">
                        <span className="text-yellow-400">Welcome</span> to <span className="text-cyan-400">Rchatix</span> 👋
                    </h2>
                    <p className="text-gray-300 text-xs">
                        A smarter way to connect with<br/>people around the world.
                    </p>
                </div>

                <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[80px] mb-4">
                    <div className="relative animate-[bounce_3s_infinite]">
                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-30 rounded-full"></div>
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl relative z-10">
                            <span className="text-3xl">💬</span>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="flex justify-between w-full mb-6 gap-2">
                    <div className="flex flex-col items-center flex-1 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                            <IoLockClosed size={20} />
                        </div>
                        <h3 className="font-bold text-sm mb-1">Secure</h3>
                        <p className="text-xs text-gray-400">Your privacy<br/>matters</p>
                    </div>

                    <div className="w-px h-16 bg-white/10 mt-4"></div>

                    <div className="flex flex-col items-center flex-1 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                            <IoPeople size={20} />
                        </div>
                        <h3 className="font-bold text-sm mb-1">Connect</h3>
                        <p className="text-xs text-gray-400">With friends<br/>anytime</p>
                    </div>

                    <div className="w-px h-16 bg-white/10 mt-4"></div>

                    <div className="flex flex-col items-center flex-1 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-teal-600/20 text-teal-400 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(20,184,166,0.4)]">
                            <IoFlash size={20} />
                        </div>
                        <h3 className="font-bold text-sm mb-1">Real-time</h3>
                        <p className="text-xs text-gray-400">Fast, smooth &<br/>reliable</p>
                    </div>
                </div>

                {/* Swipe Up Button */}
                <div 
                    className="flex flex-col items-center cursor-pointer animate-bounce mt-auto pb-4"
                    onClick={() => navigate('/login')}
                >
                    <div className="w-14 h-14 rounded-full border-2 border-purple-500/50 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(168,85,247,0.6)] bg-purple-900/40 backdrop-blur-md">
                        <IoChevronUp size={28} className="text-white" />
                    </div>
                    <p className="font-bold text-sm tracking-widest">SWIPE UP</p>
                    <p className="text-xs text-gray-400">to get started</p>
                </div>

            </div>
        </div>
    );
};

export default Welcome;
