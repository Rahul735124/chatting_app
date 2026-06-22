import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Automatically delete document after 24 hours (86400 seconds)
    }
}, { timestamps: true });

export const Status = mongoose.model("Status", statusSchema);
