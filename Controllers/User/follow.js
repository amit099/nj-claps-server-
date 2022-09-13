const MyUserControler = require(".");
const { UsersManager }  = require("../../CHAT");
const { UserModal } = require("../../Modals");
const MyErrorHandler = require("../broadcast/errorHandler");
class FollowManager{
    constructor(){

        //  followObject: {
        //     user: "", 
        //     follower: false, 
        //     following: false
        // }
        this.markFollow = (targetUserId, followObject) => {
            return new Promise((resolve, reject) => {
                console.log(`Target UID:${targetUserId}`)
                UsersManager.getUserById(targetUserId)
                .then(targetUser => { /// finding user
                    let newFollowObject = {}
                    let targetedFollowObject = null;
                    if(targetUser){ /// if user exists
                        // console.log(`User Found ... with follows`)
                        // console.log(targetUser.follows)
                        /// checking if follow object already created
                        let followIndex = targetUser.follows.findIndex(f => f.user.toString() === followObject.user.toString())
                        
                        if(followIndex >= 0){
                            // console.log(`Follow Found ... `)
                            ///  updating follow object 
                            newFollowObject = {...targetUser.follows[followIndex]._doc, ...followObject};
                            // console.log(`Overtiding object`)
                            // console.log(newFollowObject);
                            targetUser.follows[followIndex] = {...newFollowObject}
                            targetedFollowObject = {...newFollowObject}
                        }else{
                            /// if not created then creating new follow object
                            // console.log(`Follow not found`)
                            let newFollow = { 
                                following: false,
                                follower:false
                            }
                            /// syncing object with input object
                            newFollowObject = {...newFollow, ...followObject};
                            // console.log(`Creating Object`)
                            // console.log(newFollowObject)

                            /// pushing to follows array
                            targetUser.follows.push(newFollowObject);
                            followIndex = targetUser.follows.length-1;
                        }
                       
                        /// handling if follower=false && following=false; then removing object
                        
                        /// TODO: can uncomment following lines as well..
                        // if(!newFollowObject.following && !newFollowObject.follower){
                        //     // console.log(`Deleting Object .... `)
                        //     targetUser.follows = targetUser.follows.filter(f => f.user.toString() !== followObject.user.toString())
                        // }
                        
                        // targetUser.follows = []
                        // console.log(`Saving object...`)
                        // console.log(targetUser.follows)

                        // MyUserControler.updateUser(targetUser, {follows: []})
                        // .then(savedUser => {
                        //     console.log(`Saved!`)
                        //     resolve(newFollowObject)
                        // }).catch(err => {
                        //     console.log("Not Saved!")
                        //     console.log(err);
                        //     reject(MyErrorHandler.catchBuilder(err))
                        // })
                        // /// saving object
                        targetUser.save()
                            .then(savedUser => {
                                // console.log(`After Saved!`)
                                if(!targetedFollowObject){
                                    targetedFollowObject = savedUser.follows[followIndex]._doc;
                                }
                                UsersManager.getUserById(followObject.user)
                                    .then((followUser) => {
                                        resolve({...targetedFollowObject, fullName: followUser.fullName, username: followUser.username, profileImage: followUser.profileImage})
                                    }).catch((err => {
                                        resolve({...targetedFollowObject, fullName: savedUser.fullName, username: savedUser.username, profileImage: savedUser.profileImage})
                                    }))
                            }).catch(err => {
                                console.log(err);
                                reject(MyErrorHandler.catchBuilder(err))
                            })

                    }else{
                        reject(MyErrorHandler.build("Invalid User"))
                    }
                }).catch(err => {
                    reject(err);
                })
            }) 
        }



        this.followUser = (followingUserID, followerId ) => {
            return new Promise((resolve, reject) => {
                this.markFollow(followingUserID, {user: followerId, following: true})
                    .then(singleFollow => {
                        this.markFollow(followerId, {user: followingUserID, follower: true })
                            .then(updatedFollow => {
                                resolve(singleFollow)
                            }).catch(err => {
                                reject(err);
                            })
                    }).catch(err => {
                        reject(err);
                    })
            })
        }
        this.unfollowUser = (followingUserID, followerId) => {
            return new Promise((resolve, reject) => {
                this.markFollow(followingUserID, {user: followerId, following: false})
                .then(singleFollow => {
                    this.markFollow(followerId, {user: followingUserID, follower: false })
                        .then(updatedFollow => {
                            resolve(singleFollow)
                        }).catch(err => {
                            reject(err);
                        })
                }).catch(err => {
                    reject(err);
                })
            })
        }

        this.getFollowers = (userId) => {
            return new Promise((resolve, reject) => {
                UserModal.findById(userId)
                    .populate({
                        path: "follows",
                        populate: { path: "user", select: "_id username fullName phoneNumber profileImage" },
                    })
                    .then(foundUser => {
                        if(foundUser){
                            let follows = foundUser.follows.filter(f => f.follower === true).map(ff => ({...ff.user._doc, follower: ff.follower, following: ff.following}));
                            resolve(follows)
                        }else{
                            reject(MyErrorHandler.build("Invalid User"))
                        }
                    }).catch(err => {
                        reject(MyErrorHandler.catchBuilder(err))
                    })
            })
        }
        this.getFollowings = (userId) => {
            return new Promise((resolve, reject) => {
                UserModal.findById(userId)
                    .populate({
                        path: "follows",
                        populate: { path: "user", select: "_id username fullName phoneNumber profileImage" },
                    })
                    .then(foundUser => {
                        if(foundUser){
                            let follows = foundUser.follows.filter(f => f.following === true).map(ff => ({...ff.user._doc, follower: ff.follower, following: ff.following}));
                            resolve(follows)
                        }else{
                            reject(MyErrorHandler.build("Invalid User"))
                        }
                    }).catch(err => {
                        reject(MyErrorHandler.catchBuilder(err))
                    })
            })
        }


        
    }
}
module.exports = FollowManager;