
const MyUserController = require("../User")
const {BroadcastMemberModal}  = require("../../Modals")
const uuid = require("uuid")
const crypto = require("crypto");
const MyErrorHandler = require("./errorHandler");
const BroadcastConstants = require("./constants");

class BroadcastMemberController {
    constructor(){
        const randU32Sync = () => {
            return crypto.randomBytes(4).readUInt32BE(0, true);
        }
        this.generateUID32Bit = () => {
          return randU32Sync()
        }
        this.generateValidUID32Bit = (uid = undefined, attempts = 0) => {
            return new Promise((resolve, reject) => {
                if(uid){
                    this.getByUID(uid)
                        .then(user => {
                            if(user){
                                this.generateValidUID32Bit(this.generateUID32Bit(), attempts+1 ).then(res => resolve(res)).catch(err => reject(err))
                            }else{
                                resolve({uid, attempts})
                            }
                        }).catch(err => {
                            reject(err);
                        })
                }else{
                    this.generateValidUID32Bit(this.generateUID32Bit(), attempts+1 ).then(res => resolve(res)).catch(err => reject(err))
                }
            })
        }
        this.getUUID = () => {
            return uuid.v4();
        }
        this.createNew = (userId, channelName, uid ,isModrator) => {
            return new Promise((resolve, reject) => {

                MyUserController.getUserById(userId)    
                .then(user => {
                    if(user){
                        // const uid = this.generateUID32Bit();
                        // resolve({uid, channelName})
                        let newMember = new BroadcastMemberModal({
                            user:userId, 
                            stream:{uid, channelName}, 
                            isModrator, 
                            memberRole: isModrator? BroadcastConstants.MEMBER_ROLES.BROADCASTER: BroadcastConstants.MEMBER_ROLES.AUDIANCE, 
                            microphoneStatus: isModrator? BroadcastConstants.MICROPHONE.UNMUTE: BroadcastConstants.MICROPHONE.MUTE
                        })
                        newMember.save()
                            .then(savedUser => {
                                savedUser.populate("user", (err) => {
                                    resolve(savedUser);
                                })
                            }).catch(err => {
                                if(err.code === 11000){
                                    reject(MyErrorHandler.build("Member Already Exists"))
                                }else{
                                    console.log(`CATCH error, creating new broadcast member`);
                                    console.log(err)
                                    reject(err);
                                }
                            })
                    }else{
                        reject({error: {message: "No user found"}})
                    }
                }).catch(err => {
                    console.log(`CATCH error, gettting User: BroadcastMemberController`);
                    reject(err);
                })
            })
        }
        this.createOrGet = (userId, channelName, isModrator) => {
            return new Promise((resolve, reject) => {
                this.getByMemberId(userId)
                    .then(foundUser => {
                        resolve(foundUser);
                    }).catch(err => {
                        this.createNew(userId, channelName, isModrator)
                            .then(createdUser => {
                                resolve(createdUser)
                            }).catch(err =>{
                                reject(err);
                            })
                    })
            })
        }
        this.delete = (memberId) => {
            return new Promise((resolve, reject) => {
                BroadcastMemberModal.deleteOne({_id: memberId})
                    .then(deltedBroadcast => {
                        resolve(deltedBroadcast)
                    }).catch(err =>{
                        reject(err);
                    })
            })
        }
        this.deleteByUserId = (userId) => {
            return new Promise((resolve, reject) => {
                console.log(`Removing Member with id: ${userId}`)
                this.getByUserId(userId)
                    .then(roomMember =>{
                        if(roomMember){
                            BroadcastMemberModal.deleteOne({user: userId})
                            .then(deltedBroadcast => {
                                console.log(`Deleted member`);
                                console.log(deltedBroadcast)
                                resolve(roomMember)
                            }).catch(err =>{
                                reject(MyErrorHandler.catchBuilder(err));
                            })
                        }else{
                            reject(MyErrorHandler.build("Invalid User Id"))
                        }
                    }).catch(err =>{
                        reject(MyErrorHandler.catchBuilder(err))
                    })
               
             
            })
        }
        this.deleteManyByUserId = (userIds) => {
            return new Promise((resolve, reject) => {
                console.log(`Removing Members}`)
                BroadcastMemberModal.deleteMany({user: {"$in": userIds}})
                .then(deltedBroadcast => {
                    console.log(`Deleted members`);
                    console.log(deltedBroadcast)
                    resolve(true)
                }).catch(err =>{
                    reject(MyErrorHandler.catchBuilder(err));
                })
            })
        }
        
        this.getByMemberId = (userId) => {
            return new Promise((resolve, reject) => {
                BroadcastMemberModal.findById(userId)
                    .then(foundUser => {
                        resolve(foundUser)
                        // if(foundUser){
                        //     resolve(foundUser)
                        // }else{ 
                        //     reject("User Not found");
                        // }
                    }).catch(err => {
                        console.log(`CATCH Error in getting user`);
                        console.log(err);
                        reject(err);
                    })
            })
        }
        this.getByUserId = (userId) => {
            return new Promise((resolve, reject) => {
                BroadcastMemberModal.findOne({user:userId})
                    .then(foundUser => {
                        resolve(foundUser)
                        // if(foundUser){
                        //     resolve(foundUser)
                        // }else{ 
                        //     reject("User Not found");
                        // }
                    }).catch(err => {
                        console.log(`CATCH Error in getting user`);
                        console.log(err);
                        reject(err);
                    })
            })
        }
        this.getByUID = (uid) => {
            return new Promise((resolve, reject) => {
                BroadcastMemberModal.findOne({"stream.uid": uid})
                    .then(foundUser => {
                        resolve(foundUser)
                        // if(foundUser){
                        //     resolve(foundUser)
                        // }else{ 
                        //     reject("User Not found");
                        // }
                    }).catch(err => {
                        console.log(`CATCH Error in getting user`);
                        console.log(err);
                        reject(err);
                    })
            })
        }
        this.getAll = () =>{
            return new Promise((resolve, reject) => {
                BroadcastMemberModal.find()
                    .then(members =>{
                        resolve(members);
                    }).catch(err =>{
                        reject(err);
                    })
            })
        }

        this.updateByUserId = (userId, object) => {
            console.log(`ORA: test 3, ${userId}`)
            console.log(object);

            return new Promise((resolve, reject) => {
                BroadcastMemberModal.updateOne({user:userId}, object)
                    .then(updatedMember => {
                        console.log(`ORA: test 4: pass`)

                        this.getByUserId(userId)
                            .then(member => {
                            console.log(`ORA: test 5: pass`)
                                if(member){
                                    console.log(`ORA: test 6: pass`)
                                    resolve(member);
                                }else{
                                    console.log(`ORA: test 6: fail`)
                                    reject(MyErrorHandler.build("invalid member"));
                                }
                            }).catch(err => {
                                console.log(`ORA: test 5: fail`)
                                reject(MyErrorHandler.build("User Updated but not able to find user"));
                            })
                    }).catch(err => {
                            console.log(`ORA: test 4: fail`)
                        reject( MyErrorHandler.build("User Not updated") )
                    })
            })
        }
    }
}
const MyBroadcastMemberController = new BroadcastMemberController();
module.exports = MyBroadcastMemberController;