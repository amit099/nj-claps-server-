const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StreamsModal = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "tblusers"
    }, 
    dateTime: {
        type: Date, 
        default: Date.now()
    }, 
    streamSource: {
        url: String, 
        poster: String,
    },
    description: {
        type: String
    },
    seenBy: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId, 
                ref: "tblusers"
            },
            user: {
                type: mongoose.Schema.Types.ObjectId, 
                ref: "tblusers"
            },
            liked: {
                type: Boolean,
                default: false
            }
        }
    ],
    comments: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId, 
                ref: "tblusers"
            },
            user: {
                type: mongoose.Schema.Types.ObjectId, 
                ref: "tblusers"
            },
            text:{
                type: String,
            },
            commentType: {
                type: String,
            },
            payload: {
                type: String,
            },
            dateTime:{
                type: Date, 
                default: Date.now()
            }
        }
    ],
})

module.exports = mongoose.model("tblstreams", StreamsModal);