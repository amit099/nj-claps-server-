const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StoryUsersModal = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "tblusers"
    },
    stories: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "tblstories"
    }], 
    updatedAt: {
        type: Date
    }
})
module.exports = mongoose.model("tblstoryusers", StoryUsersModal);