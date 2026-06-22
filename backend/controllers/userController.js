import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";



export const register = async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;
        if (!fullName || !username || !password || !confirmPassword || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match" });
        }

        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "Username already exit try different" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // profilePhoto
        const maleProfilePhoto = `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`;
        const femaleProfilePhoto = `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`;

        await User.create({
            fullName,
            username,
            password: hashedPassword,
            profilePhoto: gender === "male" ? maleProfilePhoto : femaleProfilePhoto,
            gender
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        };
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect username or password",
                success: false
            })
        };
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect username or password",
                success: false
            })
        };
        const tokenData = {
            userId: user._id
        };

        const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: true }).json({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            profilePhoto: user.profilePhoto,
            token: token
        });

    } catch (error) {
        console.log(error);
    }
}
export const logout = (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "logged out successfully."
        })
    } catch (error) {
        console.log(error);
    }
}
import { Message } from "../models/messageModel.js";
import mongoose from "mongoose";

export const getOtherUsers = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        const unreadCounts = await Message.aggregate([
            { $match: { receiverId: new mongoose.Types.ObjectId(loggedInUserId), isRead: false } },
            { $group: { _id: "$senderId", count: { $sum: 1 } } }
        ]);

        const unreadMap = {};
        unreadCounts.forEach(item => {
            unreadMap[item._id.toString()] = item.count;
        });

        const usersWithUnread = otherUsers.map(user => {
            return {
                ...user.toJSON(),
                unreadCount: unreadMap[user._id.toString()] || 0
            };
        });

        return res.status(200).json(usersWithUnread);
    } catch (error) {
        console.log(error);
    }
}

export const updateProfile = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        
        if (!req.file) {
            return res.status(400).json({ message: "No image provided" });
        }
        
        const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" });
        const photoUrl = result.secure_url;
        fs.unlinkSync(req.file.path);
        
        const updatedUser = await User.findByIdAndUpdate(
            loggedInUserId,
            { profilePhoto: photoUrl },
            { new: true }
        ).select("-password");

        return res.status(200).json({
            message: "Profile photo updated successfully",
            success: true,
            user: updatedUser
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { username, fullName, gender, newPassword } = req.body;
        
        if (!username || !fullName || !gender || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User not found with this username" });
        }

        // Verify security details (case insensitive comparison for name)
        if (user.fullName.toLowerCase() !== fullName.toLowerCase() || user.gender !== gender) {
            return res.status(400).json({ message: "Security verification failed. Details do not match." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });

        return res.status(200).json({
            message: "Password reset successfully",
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}