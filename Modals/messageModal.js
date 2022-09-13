const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageModal = new Schema({
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
})

module.exports = mongoose.model("tblmessages", MessageModal);