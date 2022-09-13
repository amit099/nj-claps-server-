const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TribesSchema = new Schema({
    name: {
        type: String, 
    }, 
    description: {
        type: String,
    }, 
    picture: {
        imageKey: {type:String},
        imageUrl: {type: String},
        thumbnail: {type: String}
    },
    modrator: {
             type: mongoose.Schema.Types.ObjectId, 
             ref: "tblusers"
    }, 
    members: [{
             type: mongoose.Schema.Types.ObjectId, 
             ref: "tblusers"
    }], 
    rooms: [{
             type: mongoose.Schema.Types.ObjectId, 
             ref: "tblrooms"
    }], 
    createdAt: {
        type: Date, 
        defaultValue: Date.now()
    }
})
module.exports = mongoose.model("tbltribes", TribesSchema);
