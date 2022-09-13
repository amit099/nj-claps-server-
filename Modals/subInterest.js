const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SubInterestSchema = new Schema({
    title: {
        type: String
    },
    payload: {
        type: Object,
        default: null
    },
    selected: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default : Date.now()
    }
})

SubInterestSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.__v;
        return ret;
    }
});
module.exports = mongoose.model("tblsubinterests", SubInterestSchema);