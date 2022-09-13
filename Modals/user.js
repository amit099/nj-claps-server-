const mongoose = require("mongoose");
const { SIMPLE } = require("../Controllers/constVariables");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    profileImage: {
        imageName: {
            type: String
        },
        imageUrl: {
            type: String
        },
        avatarName: {
            type: String,
        },
        avatarUrl: {
            type: String
        },
        thumbnail: {
          type: String
        }
    },
    fullName: {
        type: String
    },
    username: {
        type: String
    },
    email: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    address: {
        type: String
    },
    password: {
        type: String
    },
    interests: [{
        mainType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tblmaininterests"
        },
        subType: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "tblsubinterests"
        }]
    }],
    socials: [{
        accountId: {
            type: String,
            default: "N4o9UCqD3HbHsCgWgV4ekOhxVYz2"
        },
        payload: {
            type: Object,
            default: null,
        }
    }],
    socialLinks:[{
      linkType: Number, 
      value: String,
    }],
    bio: {
        type: String,
    },
    accountCreatedType: {
        type: String,
        default: SIMPLE
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }, 
    notifyTokens: [{
        deviceType: {
          type: String, 
          require: true,
        }, 
        notifyToken: {
          type: String, 
          require: true
        }
      }],
      pushActions: [
        {
          pushType: {
            type: Number,
            require: true,
          },
          payload: {
            type: String,
          },
          datetime: {
            type: Date,
          },
        },
      ],
      userChat: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "tbluserchats",
        },
      ],
      userStatus: {
        type: String
      },
      activeRoom: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "tblrooms"
      }, 
      follows: [{
        user:  {
          type:mongoose.Schema.Types.ObjectId,
          ref: "tblusers",
          index:false,
        }, 
        follower: {type: Boolean, default: false}, 
        following: {type: Boolean, default:false}
      }], 
      myTribe: [
        {
          type: mongoose.Schema.Types.ObjectId, 
          ref: "tbltribes"
        }
      ],
      myJoinedTribes: [
        {
          type: mongoose.Schema.Types.ObjectId, 
          ref: "tbltribes"
        }
      ], 

})

UserSchema.set("toJSON", {
    transform: function (doc, ret, options) {
      ret.followerCount = ret.follows? ret.follows.filter(f => f.follower === true).length: 0;
      ret.followingCount = ret.follows?  ret.follows.filter(f => f.following === true).length: 0;
      ret.tribeCount = ret.myTribe? ret.myTribe.length: 0;
      delete ret.__v;
      delete ret.password;
      delete ret.follows;
      return ret;
    },
  });
module.exports = mongoose.model("tblusers", UserSchema);