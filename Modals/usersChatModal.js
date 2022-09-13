const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MessageModal = require("./messageModal")
const UsersChat = new Schema({
    
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tblusers"
    }],
    lastMessageDate: {
        type: Date
    },
    messages: [{
        from: {
            type: mongoose.Schema.Types.ObjectId, 
            required: true
        }, 
        to: {
            type: mongoose.Schema.Types.ObjectId, 
            required: true
        },
        body: {
            type: Object, 
            required: true
        }, 
        status: {
            type: Number, 
            required: true
        }, 
        messageType: {
            type: String, 
            required: true
        }, 
        sentTimeDate: {
            type: Date, 
            required: true
        }, 
        seenTimeDate: {
            type: Date
        }
    }], 
    title: {
        type: String
    }, 
    admins: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "tblusers"
    }], 
    description: {
        type: String
    },
    icon: {
        thumbnail: {
            type: String
        },
        orignal: {
            type: String
        }
    }, 
    chatType: {
        type: String, 
        required: true
    }, 
    tempId:{
        type: String
    }
})



module.exports = mongoose.model("tbluserchats", UsersChat);