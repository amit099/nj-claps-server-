const mongoose  = require("mongoose");
const Schema = mongoose.Schema;
const BroadcastContants = require("../Controllers/broadcast/constants")
const BroadcastMember = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "tblusers",    
        unique:true, 
        required:true
    },
    microphoneStatus: {
        type: Number,
        default: BroadcastContants.MICROPHONE.MUTE
    }, 
    stream: {
        uid: {
            type: Number, 
        }, 
        channelName: {
            type: String
        }
    }, 
    memberRole: {
        type: Number, 
        default: BroadcastContants.MEMBER_ROLES.AUDIANCE
    },
    broadcastRequestStatus: {
        type: Number, 
        default: BroadcastContants.BROADCAST_REQUEST_STATUS.UNMARKED
    },
    lastBroadcastRequestStatus: {
        type: Number,
        default: BroadcastContants.BROADCAST_REQUEST_STATUS.UNMARKED
    }, 
    videoEnabledStatus: {
        type: Number,
        default: BroadcastContants.VIDEO_ENABLED_STATUS.DISABLED
    }, 
    onlineStatus: {
        type: Number, 
        default: BroadcastContants.ONLINE_STATUS.OFFLINE
    }, 
    isModrator: {
        type: Boolean,
        default: false
    }, 
    createdAt: {
        type: Date, 
        default: Date.now()
    },
    updatedAt: {
        type: Date, 
        default: Date.now()
    }
})

module.exports = mongoose.model("tblbroadcastmembers", BroadcastMember);