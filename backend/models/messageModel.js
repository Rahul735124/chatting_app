import mongoose from "mongoose";

const messageModel = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    message:{
        type:String,
        default:""
    },
    image:{
        type:String,
        default:""
    },
    isRead:{
        type:Boolean,
        default:false
    },
    deletedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    isDeletedForEveryone:{
        type:Boolean,
        default:false
    },
    isBot:{
        type:Boolean,
        default:false
    },
    reactions: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String }
    }],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null
    }
},{timestamps:true});
export const Message = mongoose.model("Message", messageModel);