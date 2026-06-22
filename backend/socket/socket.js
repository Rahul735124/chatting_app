import { Server } from "socket.io";
import http from "http";
import express from "express";
import { User } from "../models/userModel.js";
import { Message } from "../models/messageModel.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {}; // { userId : socketId }

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", senderId);
    }
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", senderId);
    }
  });

  socket.on("markAsRead", async ({ senderId, receiverId }) => {
    try {
      await Message.updateMany(
        { senderId, receiverId, isRead: false },
        { $set: { isRead: true } }
      );
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", { receiverId });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  socket.on("reactMessage", async ({ messageId, emoji, senderId, receiverId }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return;

      const existingReactionIndex = message.reactions.findIndex(r => r.userId.toString() === senderId.toString());
      if (existingReactionIndex !== -1) {
        if (message.reactions[existingReactionIndex].emoji === emoji) {
           message.reactions.splice(existingReactionIndex, 1);
        } else {
           message.reactions[existingReactionIndex].emoji = emoji;
        }
      } else {
        message.reactions.push({ userId: senderId, emoji });
      }
      await message.save();

      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageReacted", message);
      }
      io.to(socket.id).emit("messageReacted", message);
    } catch (error) {
      console.error("Error reacting to message:", error);
    }
  });

  socket.on("disconnect", async () => {
    if (userId && userId !== "undefined") {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));

      try {
        const lastSeenTime = Date.now();
        await User.findByIdAndUpdate(userId, { lastSeen: lastSeenTime });
        io.emit("lastSeenUpdate", { userId, lastSeen: lastSeenTime });
      } catch (error) {
        console.error("Error updating last seen:", error);
      }
    }
  });
});

export { app, io, server };
