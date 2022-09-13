const { TribesModal, TribesInvitationsModal } = require("../../Modals")
const mongoose = require("mongoose")
const BroadcastConstants = require("./constants")
const MyUserController = require("../User/index")
const {deleteS3File, deleteImageWithKey} = require("../../Config/fileUpload")
class TribesController {
    constructor(){
        this.create = (modrator, name, description, imageUrl, imageKey ,thumbnail) => {
            return new Promise((resolve, reject) => {
                TribesModal.create({name, modrator, description, picture: {imageUrl, imageKey, thumbnail}})
                 .then(created => {
                    MyUserController.getUserById(modrator)
                        .then(foundUser => {
                            foundUser.myTribe.push(created._id)
                            foundUser.save().then(saved =>false).catch(err => console.log(err))
                        }).catch(err => console.log(err))
                     resolve(created);
                 }).catch(err => {
                     reject(`Internal Server Error: create`)
                 })
            })
        }
        this.delete = (_id) => {
            return new Promise((resolve, reject) => {
                TribesModal.findByIdAndDelete(_id)
                    .then(deletedTribe => {
                        if(deletedTribe){
                            MyUserController.getUserById(deletedTribe.modrator)
                            .then(foundUser => {
                                foundUser.myTribe = foundUser.myTribe.filter(mt => mt._id.toString() !== _id);
                                foundUser.save().then(saved =>false).catch(err => console.log(err))
                            }).catch(err => console.log(err))
                            resolve(deletedTribe);
                        }else{
                           reject(`Invalid Tribe`)
                        }
                    }).catch(err => {
                        console.log(err);
                        reject(`Internal Server Error: delete`)
                    })
            })
        }
       
        this.update = (tribeId, object) => {
            return new Promise((resolve, reject) => {
                TribesModal.findOneAndUpdate({_id: tribeId}, object)
                    .then(updated => {
                        resolve({...updated._doc, ...object})
                    }).catch(err => {
                        reject(`Internal Server Error: update`)
                    })
            })
        }

        
        this.updateImage = (tribeId, imageUrl ,newImageKey) => {
            return new Promise((resolve, reject) => {
                this.getById(tribeId)
                    .then(oldTribe => {
                        if(oldTribe){
                            let oldImageKey = oldTribe.picture.imageKey;
                            oldTribe.picture = {...oldTribe.picture, imageUrl, imageKey: newImageKey};
                            oldTribe.save()
                                .then(updatedTribe => {
                                    if(oldImageKey){
                                        deleteImageWithKey(oldImageKey)
                                    }
                                    resolve(updatedTribe)
                                }).catch(err => {
                                    deleteImageWithKey(newImageKey)
                                    reject(`Unable to update tribe image`)
                                })
                        }else{
                            reject(`Invalid Tribe`)
                        }
                    }).catch(err => {
                        deleteImageWithKey(newImageKey)
                        reject(`Internal server error in getting tribe by id`)
                    })
            })
        }
        this.get = () => {
            return new Promise((resolve, reject) => {
                TribesModal.find()  
                 .then(tribes => {
                    resolve(tribes);
                 }).catch(err => {
                     reject(`Internal Server Error: get`)
                 })
            })
        }
        this.getById = (_id) => {
            return new Promise((resolve, reject) => {
                TribesModal.findById(_id)
                    .then(tribe =>{
                        resolve(tribe);
                    }).catch(err => {
                        reject(`Internal Server Error: get by id, tribe`)
                    })
            })
        }
        this.getByIdPopulated = (_id) => {
            return new Promise((resolve, reject) => {
                TribesModal.findById(_id).populate("members").populate("rooms")
                    .then(tribe =>{
                        resolve(tribe);
                    }).catch(err => {
                        reject(`Internal Server Error: get by id, populated`)
                    })
            })
        }
        this.getByModrator = (modratorId) => {
            return new Promise((resolve, reject) => {
                TribesModal.find({modrator: modratorId}).populate("members").populate("rooms")
                    .then(tribes =>{
                        resolve(tribes);
                    }).catch(err => {
                        reject(`Internal Server Error: get by id, modrator`)
                    })
            })
        }
        this.getByMemberId = (memberId) => {
            return new Promise((resolve, reject) => {
                TribesModal.find({members: mongoose.Types.ObjectId(memberId)}).populate("members").populate("rooms")
                    .then(tribes =>{
                        resolve(tribes);
                    }).catch(err => {
                        console.log(err)
                        reject(`Internal Server Error: get by id, member`)
                    })
            })
        }
        this.getTribeMembers = (tribeId) => {
            return new Promise((resolve, reject) => {
                TribesModal.findById(tribeId).populate("members")
                    .then(tribe =>{
                        resolve(tribe.members);
                    }).catch(err => {
                        reject(`Internal Server Error: get by id, tribe memeber`)
                    })
            })
        }
        this.getUserJoinedTribeIds = (userId) => {
            return new Promise((resolve, reject) => {
                TribesModal.find({members: userId})
                .then(tribes => {
                    resolve(tribes.map(t => t._id))
                }).catch(err => {
                    reject(err);
                })
            })
       
        }
        this.pushMember = (tribeId, memberId) => {
            return new Promise((resolve, reject) => {
                this.getById(tribeId)
                    .then(tribe => {
                        if(tribe){  
                            tribe.members = tribe.members.filter(m => m.toString() != memberId)
                            tribe.members.push(memberId)
                            tribe.save()
                                .then(savedTribe => {
                                    resolve(savedTribe)
                                }).catch(err => {
                                    reject("tribe not updated")
                                })
                        }else{      
                            reject("invalid tribe")
                        }
                    }).catch(err => {
                        reject(`Internal Server Error: push member`)
                    })
            })
        }
        this.removeMember = (tribeId, memberId) => {
            return new Promise((resolve, reject) => {
                this.getById(tribeId)
                .then(tribe => {
                    if(tribe){  
                        tribe.members = tribe.members.filter(m => m.toString() != memberId)
                        tribe.save()
                            .then(savedTribe => {
                                resolve(savedTribe)
                            }).catch(err => {
                                reject("tribe not updated")
                            })
                    }else{      
                        reject("invalid tribe")
                    }
                }).catch(err => {
                    reject(`Internal Server Error: push member`)
                })
            })
        }
        this.pushRoom = (tribeId, roomId) => {
            return new Promise((resolve, reject) => {
                this.getById(tribeId)
                    .then(tribe => {
                        if(tribe){  
                            tribe.rooms.push(roomId)
                            tribe.save()
                                .then(savedTribe => {
                                    resolve(savedTribe)
                                }).catch(err => {
                                    reject("tribe not updated")
                                })
                        }else{      
                            reject("invalid tribe")
                        }
                    }).catch(err => {
                        reject(`Internal Server Error: push member`)
                    })
            })
        }
        this.removeRoom = (tribeId, roomId) => {
            return new Promise((resolve, reject) => {
                this.getById(tribeId)
                .then(tribe => {
                    if(tribe){  
                        tribe.rooms = tribe.rooms.filter(m => m.toString() != roomId)
                        tribe.save()
                            .then(savedTribe => {
                                resolve(savedTribe)
                            }).catch(err => {
                                reject("tribe not updated")
                            })
                    }else{      
                        reject("invalid tribe")
                    }
                }).catch(err => {
                    reject(`Internal Server Error: push member`)
                })
            })
        }



        this.createInvitation = (user, sender, tribe) => {
            return new Promise((resolve, reject) => {
                TribesInvitationsModal.create({user, sender, tribe})
                    .then(created => {
                        resolve(created)
                    }).catch(err =>{
                        reject(`Internal Server Error: create invite`)
                    })
            })
        }
        this.updateInvitation = (invitationId, object) => {
            return new Promise((resolve, reject) => {
                TribesInvitationsModal.findOneAndUpdate({_id: invitationId},object)
                .then(updated => {
                    resolve(updated)
                }).catch(err =>{
                    reject(`Internal Server Error: update invite`)
                })
            })
        }
        this.updateInviteStatus = (inviteId, status) => {
            return new Promise((resolve, reject) => {
                this.updateInvitation(inviteId, {status})
                    .then(updatedInvite => {
                        if(status === BroadcastConstants.TRIBE_INVITE_STATUS.ACCEPTED){
                            this.delete(inviteId).then(deleted => false).catch(err => false);
                            this.pushMember( updatedInvite.tribe , updatedInvite.user )
                                .then(memberPushed => {
                                    resolve(updatedInvite)
                                }).catch(err => {
                                    reject(`Internal Server Error: update invite status:push`)
                                })
                        }else if(status === BroadcastConstants.TRIBE_INVITE_STATUS.REJECTED ){
                            this.delete(inviteId).then(deleted => false).catch(err => false);
                            resolve(updatedInvite)
                        }else{
                            resolve(updatedInvite)
                        }
                    }).catch(err => {
                        reject(`Internal Server Error: update invite status`)
                    })
            })
        }
       
        this.getInvitations = (user, sender, tribe, status) => {
            return new Promise((resolve, reject) => {
                let filters = {}
                if(user){
                    filters = {
                        ...filters,
                        user
                    }
                }
                if(sender){
                    filters = {
                        ...filters, 
                        sender
                    }
                }
                if(tribe){
                    filters = {
                        ...filters,
                        tribe
                    }
                }
                if(status){
                    filters = {
                        ...filters, 
                        status
                    }
                }

                console.log(`Getting Invitations .... `)
                console.log(filters)
                TribesInvitationsModal.find(filters)
                .populate({path: "user", select: "_id username email phoneNumber profileImage"})
                .populate({path: "sender", select: "_id username"})
                   .populate("tribe")
                .then(updated => {
                    resolve(updated)
                }).catch(err =>{
                    reject(`Internal Server Error: get invites`)
                })
            })
        }


    }
}
const MyTribesController = new TribesController();
module.exports = MyTribesController;