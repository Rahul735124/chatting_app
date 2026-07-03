import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from "react-hot-toast"
import axios from "axios";
import { BASE_URL } from '..';

const ForgotPassword = () => {
    const [user, setUser] = useState({
        username: "",
        fullName: "",
        gender: "",
        newPassword: ""
    });
    const navigate = useNavigate();

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${BASE_URL}/api/v1/user/reset-password`, user, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            toast.success(res.data.message);
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
            console.log(error);
        }
    }

    const selectGender = (selectedGender) => {
        setUser({ ...user, gender: selectedGender });
    }

    return (
        <div className="w-full max-w-sm mx-auto px-4">
            <div className='w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100'>
                <h1 className='text-3xl font-bold text-center mb-4'>Reset Password</h1>
                <p className='text-center text-sm text-gray-300 mb-4'>
                    Please answer your security questions to reset your password.
                </p>
                <form onSubmit={onSubmitHandler}>
                    <div>
                        <label className='label p-2'>
                            <span className='text-base label-text'>Username</span>
                        </label>
                        <input
                            value={user.username}
                            onChange={(e) => setUser({ ...user, username: e.target.value })}
                            className='w-full input input-bordered h-10'
                            type="text"
                            placeholder='Enter your username' required />
                    </div>
                    <div>
                        <label className='label p-2'>
                            <span className='text-base label-text'>Full Name</span>
                        </label>
                        <input
                            value={user.fullName}
                            onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                            className='w-full input input-bordered h-10'
                            type="text"
                            placeholder='Enter your exact full name' required />
                    </div>
                    
                    {/* Gender Selection */}
                    <div className='flex items-center gap-4 my-4'>
                        <label className="cursor-pointer flex items-center gap-2">
                            <span className="label-text">Male</span>
                            <input
                                type="radio"
                                name="gender"
                                className="radio border-slate-400"
                                checked={user.gender === "male"}
                                onChange={() => selectGender("male")}
                                required
                            />
                        </label>
                        <label className="cursor-pointer flex items-center gap-2">
                            <span className="label-text">Female</span>
                            <input
                                type="radio"
                                name="gender"
                                className="radio border-slate-400"
                                checked={user.gender === "female"}
                                onChange={() => selectGender("female")}
                                required
                            />
                        </label>
                    </div>

                    <div>
                        <label className='label p-2'>
                            <span className='text-base label-text'>New Password</span>
                        </label>
                        <input
                            value={user.newPassword}
                            onChange={(e) => setUser({ ...user, newPassword: e.target.value })}
                            className='w-full input input-bordered h-10'
                            type="password"
                            autoComplete="new-password"
                            placeholder='Enter new password' required />
                    </div>
                    
                    <div className='flex justify-between items-center my-2 mt-4'>
                        <p className='text-sm'><Link to="/login" className="text-blue-500 hover:underline">Back to Login</Link></p>
                    </div>

                    <div>
                        <button type="submit" className='btn btn-block btn-sm mt-2 border border-slate-700'>Reset Password</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ForgotPassword;
