
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // name: {
  //   type: String,
  //   required: true,
  // },
  // email: {
  //   type: String,
  //   required: true,
  // },
username: {
    type: String,
    required: true,
  },

});

const User = mongoose.model("first", UserSchema);
module.exports = User;
