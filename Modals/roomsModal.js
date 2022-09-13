const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomsModal = new Schema({
    roomTitle: {
        type: String
    },
    isActive: {
       type: Boolean, 
       default:false
    }, 
    members: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "tblbroadcastmembers"
    }], 
    moderator: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "tblusers"
    },
    tribe: {
        type: String
    }, 
    interest: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "tblsubinterests"
    },
    description: {
        type: String,
    }, 
    currentChannelName: {
        type: String,
    }, 
    currentAppId: {
        type: String,
    }

})
module.exports = mongoose.model("tblrooms", RoomsModal);