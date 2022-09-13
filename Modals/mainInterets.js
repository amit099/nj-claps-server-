const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MianInterestSchema = new Schema({
    title: {
        type: String
    },
    subType: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tblsubinterests"
    }],
    payload: {
        type: Object,
        default: null
    },
    createdAt: {
        type: Date,
        default : Date.now()
    }
})

MianInterestSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.__v;
        return ret;
    }
});
module.exports = mongoose.model("tblmaininterests", MianInterestSchema);