const MyErrorHandler = require("../Controllers/broadcast/errorHandler");
const { UserModal } = require("../Modals");

class UsersManager {
  constructor() {
    this.createUser = (phoneNumber, username = "") => {
      let un = username === "" ? phoneNumber : username;
      let user = new Users({
        username: un,
        phoneNumber: phoneNumber,
      });
      return new Promise((resolve, reject) => {
        user
          .save()
          .then((sUser) => {
            resolve(sUser);
          })
          .catch((err) => {
            reject(err);
          });
      });
    };

    this.getAllUsers = () => {
      return new Promise((resolve, reject) => {
        UserModal.find()
          .then((users) => {
            resolve(users);
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      });
    };

    this.getUserAllChats = (userId) => {
      return new Promise((resolve, reject) => {
        UserModal.findById(userId)
          .populate({ path: "userChat" })
          .populate({
            path: "userChat",
            populate: { path: "users", select: "_id username fullName phoneNumber userStatus thumbnail imageUrl" },
          })
          .then((user) => {
            resolve(user);
          })
          .catch((err) => {
            reject(err);
          });
      });
    };

    this.userExists = (phoneNumber) => {
      return new Promise((resolve, reject) => {
        UserModal.findOne({ phoneNumber: phoneNumber })
          .then((oUser) => {
            if (oUser) {
              resolve({ success: true, value: oUser });
            } else {
              resolve({ success: false, value: oUser });
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    };
    this.updateNotifyToken = (userId, notifyToken, platform) => {
      return new Promise((resolve, reject) => {
        // console.log(`>Updating Notify Token for ${userId}`)
        UserModal.findById(userId)
          .then((oldUser) => {
            if (oldUser) {
              let myTokens = [...oldUser.notifyTokens];
              let updatedToken = {
                deviceType: platform, 
                notifyToken: notifyToken
              }
              let tokenIndex = myTokens.findIndex(t => t.deviceType === platform);
              if(tokenIndex >= 0){
                myTokens[tokenIndex] = updatedToken;
              }else{
                myTokens.push(updatedToken);
              }
              // oldUser.notifyTokens = myTokens;
              UserModal.updateOne({_id: userId}, {notifyTokens: myTokens})
              .then((savedUser) => {
                  // console.log("Updated User !");
                  // console.log(savedUser);
                  resolve(myTokens);
                })
                .catch((err) => {
                  console.log("Catch Error in saving User");
                  console.log(err);
                  reject("Error in saving User");
                });
            } else {
              reject("Invalid User");
            }
          })
          .catch((err) => {
            console.log("Catch error, updating notify tken ");
            console.log(err);
            reject(err);
          });

      });
    };

    this.updateUser = (user) => {
      return new Promise((resolve, reject) => {
       UserModal.findById(user._id)
        .then(foundUser => {
          if(foundUser){
            UserModal.updateOne({_id: user._id}, {username: user.username, userStatus: user.status})
             .then(updated => {
               foundUser.username = user.username;
               foundUser.userStatus = user.status;
               resolve({success: true, user: foundUser})
             }).catch(err => {
              console.log(err);
              reject({success: false, error: "Not Found Error"});
             })
          }else{
            reject({success:false, error: "User Not Found"})
          }
        }).catch(err => {
          console.log(err);
          reject({success:false, error: "Not Found Error"});
        })
      })
    }

    this.getUserPublicInfo = (userId) => {
      console.log(`>Geting user public info ${userId}`)
      return new Promise((resolve, reject) => {
        UserModal.findById(userId)
          .then(foundUser => {
            // console.log(foundUser)
            if(foundUser){
              // console.log(`Resolving...`)
              resolve({success: true, user: {
                _id: foundUser._id, 
                username: foundUser.username, 
                userStatus: foundUser.userStatus, 
                phoneNumber: foundUser.phoneNumber, 
                imageUrl: foundUser.profileImage.imageUrl, 
                thumbnail: foundUser.profileImage.thumbnail?foundUser.profileImage.thumbnail:""} 
              })
            }else{
              reject({success:false, error: "User Not Found"})
            } 
          }).catch(err => {
            console.log(err);
            reject({success:false, error: "Not found Error"});
          })
      })
    }
    this.updateUserProfileImage = (userId,imageURL, thumbnail) => {
     console.log(`>Updating User Profile Image, USERID:${userId}`);
    console.log(thumbnail);
      return new Promise((resolve, reject) => {
        UserModal.findById(userId)
        .then(foundUser => {
          // console.log(foundUser)
          if(foundUser){
            console.log(`>User Found`);
            // console.log(`Resolving...`)
            UserModal.updateOne({_id: userId }, {thumbnail: thumbnail, imageUrl: imageURL})
              .then(res => {
                console.log(`>User Updating`);
                console.log(res);
                resolve({success: true, user: {_id: foundUser._id, username: foundUser.username, userStatus: foundUser.userStatus, phoneNumber: foundUser.phoneNumber, imageUrl: imageURL, thumbnail: thumbnail} })
              }).catch(err => {
                console.log("CATCH Error updating user info")
                console.log(err);
                reject({success:false, error: "Not Found Error"});
              })
          }else{
            console.log("User Not Found");
            resolve({success:false, user: null})
          } 
        }).catch(err => {
          console.log("CATCH error finding user by Id");
          console.log(err);
          reject({success:false, error: "Not found Error"});
        })
      })
    }

    this.getUserById = (userId) => {
      return new Promise((resolve, reject) => {
        UserModal.findById(userId)
          .then(user => {
            resolve(user);
          }).catch(err => {
            reject( MyErrorHandler.catchBuilder(err) )
          }) 
      } )
    }

    this.getUserInterest = (userId) => {
      return new Promise((resolve, reject) => {
        this.getUserById(userId)
          .then(user => {
              if(user){
                resolve(user.interests);
              }else{
                reject(MyErrorHandler.build("Invalid User"))
              }
          }).catch(err =>{
            reject(err);
          })
      })
    }
 
    
  }
}

module.exports = UsersManager;
