
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const VerificationCodeSchema = new Schema({
    verificationOn: {
        type: String
    },
    code: {
        type: String
    },
    verificationMethod: {
        type: String
    },
    personType: {
        type: String
    },
    createdAt: {
        type: Date,
        default : Date.now()
    }
})

VerificationCodeSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.__v;
        return ret;
    }
});
module.exports = mongoose.model("tblverificationcodes", VerificationCodeSchema);