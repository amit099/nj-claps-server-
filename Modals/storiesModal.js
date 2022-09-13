const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StoriesSchema = new Schema({
    
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "tblusers"
    },
    storyUserId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "tblstoryusers"
    },
    createdAt: {
        type: Date
    },
    removeAt: {
        type: Date
    },
    media: {
        payload: {
            type:String
        }, 
        key: {
            type:String
        }, 
        placeholder: {
            type:String
        },
        mediaType: {
            type:String
        },
    },
    views: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "tblusers"
        }, 
        viewedAt: {
            type: Date
        }
    }],
    description: {
        type: String
    }
})

module.exports = mongoose.model("tblstories", StoriesSchema);