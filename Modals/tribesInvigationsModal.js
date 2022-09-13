const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BroadcastConstants = require("../Controllers/broadcast/constants")
const TribesInvitationSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "tblusers"
    }, 
    tribe: {
        type:mongoose.Schema.Types.ObjectId, 
        ref:"tbltribes"
    }, 
    sender: {
        type:mongoose.Schema.Types.ObjectId, 
        ref: "tblusers",
    }, 
    sentDateTime: {
        type: Date, 
        default: Date.now()
    },
    status: {
        type: Number,
        default: BroadcastConstants.TRIBE_INVITE_STATUS.PENDING
    }
})

module.exports = mongoose.model("tbltribeinvitations", TribesInvitationSchema)