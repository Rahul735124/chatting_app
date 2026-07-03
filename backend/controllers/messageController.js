import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import { moderateMessage, generateReply } from "../services/aiService.js";
import { User } from "../models/userModel.js";

export const sendMessage = async (req,res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const {message, replyTo} = req.body;

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        if (sender.blockedUsers?.includes(receiverId)) {
            return res.status(403).json({ message: "You have blocked this user" });
        }

        if (receiver.blockedUsers?.includes(senderId)) {
            return res.status(403).json({ message: "You are blocked by this user" });
        }

        if (message) {
            const isUnsafe = await moderateMessage(message);
            if (isUnsafe) {
                return res.status(400).json({ message: "Message blocked due to policy violation." });
            }
        }

        let image = "";
        if(req.file){
            const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" });
            image = result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        let gotConversation = await Conversation.findOne({
            participants:{$all : [senderId, receiverId]},
        });

        if(!gotConversation){
            gotConversation = await Conversation.create({
                participants:[senderId, receiverId]
            })
        };
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message: message || "",
            image,
            replyTo: replyTo || null
        });
        if(newMessage){
            gotConversation.messages.push(newMessage._id);
        };
        

        await Promise.all([gotConversation.save(), newMessage.save()]);
         
        await newMessage.populate("replyTo");

        // SOCKET IO
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", JSON.parse(JSON.stringify(newMessage)));
        }

        // Handle AI Assistant
        if (message && message.startsWith("/ai")) {
            (async () => {
                try {
                    const aiResponseText = await generateReply(message.replace("/ai", "").trim());
                    const aiMessage = await Message.create({
                        senderId: senderId,
                        receiverId: receiverId,
                        message: aiResponseText,
                        isBot: true
                    });
                    
                    gotConversation.messages.push(aiMessage._id);
                    await gotConversation.save();
                    
                    const botMessageJson = JSON.parse(JSON.stringify(aiMessage));
                    
                    // Emit to receiver
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit("newMessage", botMessageJson);
                    }
                    // Emit back to sender so they see the bot's response
                    const senderSocketId = getReceiverSocketId(senderId);
                    if (senderSocketId) {
                        io.to(senderSocketId).emit("newMessage", botMessageJson);
                    }
                } catch (error) {
                    console.error("AI Assistant background error:", error);
                }
            })();
        }

        return res.status(201).json({
            newMessage
        })
    } catch (error) {
        console.log(error);
    }
}
export const getMessage = async (req,res) => {
    try {
        const receiverId = req.params.id;
        const senderId = req.id;
        const conversation = await Conversation.findOne({
            participants:{$all : [senderId, receiverId]}
        }).populate({
            path: "messages",
            populate: { path: "replyTo" }
        }); 

        if (!conversation) return res.status(200).json([]);

        // Filter and censor messages
        const filteredMessages = conversation.messages
            .filter(msg => !msg.deletedBy.includes(senderId))
            .map(msg => {
                if (msg.isDeletedForEveryone) {
                    return { ...msg.toObject(), message: "This message was deleted", image: "" };
                }
                return msg;
            });

        return res.status(200).json(filteredMessages);
    } catch (error) {
        console.log(error);
    }
}

export const markMessagesAsRead = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const senderId = req.params.id;
        
        await Message.updateMany(
            { senderId: senderId, receiverId: loggedInUserId, isRead: false },
            { $set: { isRead: true } }
        );
        
        return res.status(200).json({ success: true, message: "Messages marked as read" });
    } catch (error) {
        console.log(error);
    }
}

export const deleteMessages = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const { messageIds, type, receiverId } = req.body;

        if (type === "CLEAR_CHAT" && receiverId) {
            // Find all messages in conversation
            const conversation = await Conversation.findOne({
                participants: { $all: [loggedInUserId, receiverId] }
            });
            if (conversation) {
                await Message.updateMany(
                    { _id: { $in: conversation.messages } },
                    { $addToSet: { deletedBy: loggedInUserId } }
                );
            }
            return res.status(200).json({ success: true, message: "Chat cleared" });
        }

        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return res.status(400).json({ message: "No messages provided" });
        }

        if (type === "FOR_ME") {
            await Message.updateMany(
                { _id: { $in: messageIds } },
                { $addToSet: { deletedBy: loggedInUserId } }
            );
        } else if (type === "FOR_EVERYONE") {
            // Only update messages sent by loggedInUserId
            await Message.updateMany(
                { _id: { $in: messageIds }, senderId: loggedInUserId },
                { $set: { isDeletedForEveryone: true, message: "This message was deleted", image: "" } }
            );
            
            // SOCKET IO: Notify receiver
            if (receiverId) {
                const receiverSocketId = getReceiverSocketId(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("messagesDeleted", messageIds);
                }
            }
        }

        return res.status(200).json({ success: true, message: "Messages deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}