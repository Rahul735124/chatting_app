import { Status } from "../models/statusModel.js";
import { io } from "../socket/socket.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const uploadStatus = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        
        if (!req.file) {
            return res.status(400).json({ message: "No image provided" });
        }
        
        const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" });
        const photoUrl = result.secure_url;
        fs.unlinkSync(req.file.path);
        
        const newStatus = await Status.create({
            userId: loggedInUserId,
            imageUrl: photoUrl
        });

        // Populate the user data before sending back
        await newStatus.populate("userId", "fullName profilePhoto username");

        // SOCKET IO: Broadcast new status
        io.emit("newStatus", {
            user: newStatus.userId,
            statuses: [newStatus]
        });

        return res.status(201).json({
            message: "Status uploaded successfully",
            success: true,
            status: newStatus
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllStatuses = async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        // Fetch all non-expired statuses and populate user info and viewers
        const statuses = await Status.find({ createdAt: { $gt: twentyFourHoursAgo } })
            .populate("userId", "fullName profilePhoto username")
            .populate("viewers", "fullName profilePhoto")
            .sort({ createdAt: -1 });

        // Group statuses by user
        const groupedStatuses = {};
        
        statuses.forEach(status => {
            const userId = status.userId._id.toString();
            if (!groupedStatuses[userId]) {
                groupedStatuses[userId] = {
                    user: status.userId,
                    statuses: []
                };
            }
            groupedStatuses[userId].statuses.push(status);
        });

        // Convert grouped object to array
        const result = Object.values(groupedStatuses);

        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const markStatusViewed = async (req, res) => {
    try {
        const statusId = req.params.id;
        const loggedInUserId = req.id;

        const status = await Status.findById(statusId);
        if (!status) {
            return res.status(404).json({ message: "Status not found" });
        }

        // Don't add if viewing own status
        if (status.userId.toString() === loggedInUserId.toString()) {
            return res.status(200).json({ success: true });
        }

        // Add if not already viewed using $addToSet to prevent duplicates in race conditions
        const hasViewed = status.viewers.some(v => v._id ? v._id.toString() === loggedInUserId.toString() : v.toString() === loggedInUserId.toString());
        if (!hasViewed) {
            const updatedStatus = await Status.findByIdAndUpdate(
                statusId,
                { $addToSet: { viewers: loggedInUserId } },
                { new: true }
            ).populate("viewers", "fullName profilePhoto");
            
            const ownerSocketId = getReceiverSocketId(status.userId.toString());
            if (ownerSocketId) {
                io.to(ownerSocketId).emit("statusViewed", {
                    statusId: updatedStatus._id,
                    viewers: updatedStatus.viewers
                });
            }
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteStatus = async (req, res) => {
    try {
        const statusId = req.params.id;
        const loggedInUserId = req.id;

        const status = await Status.findById(statusId);
        if (!status) {
            return res.status(404).json({ message: "Status not found" });
        }

        // Verify ownership
        if (status.userId.toString() !== loggedInUserId.toString()) {
            return res.status(403).json({ message: "You can only delete your own status" });
        }

        await Status.findByIdAndDelete(statusId);

        // SOCKET IO: Broadcast deletion
        io.emit("statusDeleted", statusId);

        return res.status(200).json({ success: true, message: "Status deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
