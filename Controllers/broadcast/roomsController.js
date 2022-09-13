const { RoomsModal } = require("../../Modals");
const MyUserControler = require("../User");
const MyBroadcastMemberController = require("./broadcastMemberController");
const BroadcastConstants = require("./constants");
const MyErrorHandler = require("./errorHandler");
const MyTribesController = require("./tribesController");
class RoomsController{
    constructor(){

        this.onRoomHosted = (userId, roomId, channelName, uid, _callback = (error, room, users) => {}) => {
            /// update room
            this.updateRoom(roomId, { isActive: true, currentChannelName: channelName})
                .then(roomUpdated =>{
                    /// add modrator as member to group
                    this.pushMember(roomId, userId, channelName, uid, true )
                        .then(updatedRes => {
                            /// get all the uses matching room interest
                             this.getRelatedMembers(updatedRes.room)
                                .then(userIds => {
                                    /// excluding myself
                                    console.log("TEST6: pass")
                                    let users = userIds.filter(u => u != userId)
                                    console.log("TEST7: pass")
                                    console.log(users);
                                    /// resolving
                                    _callback(null, updatedRes.room, users);
                                }).catch(err => {
                                    _callback(err, null, []);
                                })
                        }).catch(err => {
                            _callback(err, null, [])
                        })
                }).catch(err =>{
                    _callback(err, null, [])
                })
        }

        this.onNewRoomMember = ( userId, roomId, channelName, uid, _callback = (error, room, users) => {}) => {
           /// check if any restriction on user
            this.varifyUsersPrivilageToRoom(userId, roomId)
                .then(() => {
                    /// push as room member
                    this.pushMember(roomId, userId, channelName, uid )
                    .then(updatedRes => {

                        /// preparing array of ids and excluding myself
                        let users = updatedRes.room.members.map(m => m.user._id).filter(id => id != userId);
                        ///resolving
                        _callback(null, updatedRes,users )
                    }).catch(err => {
                        _callback(err, null)
                    })
                }).catch(err => {
                    _callback(err, null)
                })
        }
        

        this.onRoomMemberLeave = ( userId, roomId, _callback = (error, room, users) => {}) => {
            this.removeMember(roomId, userId)
                .then(({room, member,memberIds}) => {
                    // let users = room.members.map(m => m.user._id);
                    _callback(null, {room, member}, memberIds)
                }).catch(err => {
                    _callback(err, null)
                })
        }

        this.onRoomEnd = ( roomId, _callback = (error, room) => {}    ) => {
           
            this.getRoomMembers(roomId)
                .then(memberIds => {
                    console.log(`T1: Room member found list`);
                    console.log(memberIds);
                    MyBroadcastMemberController.deleteManyByUserId(memberIds)
                        .then(deleted => {
                            console.log(`T:2 Members Deleted.... `)
                            this.updateRoom(roomId, {members: [], isActive:false, channelName: ""})
                                .then(updatedRoom => {
                                    console.log(`T:3 Room Updated.`)
                                    this.flushUsersActiveRooms(memberIds)
                                    _callback(null, true, memberIds)
                                }).catch(err => {
                                    console.log(`CATCH Error in updating room`)
                                    console.log(err);
                                    _callback(err, null);
                                })
                        }).catch(err => {
                            console.log(`CATCH Erorr in deleting members`)
                            console.log(err);
                            _callback(err, null);

                        })
                }).catch(err => {
                    _callback(err, null);
                })
            
        }


    



            
        this.onRoomAction = ( action, _callback = (error, room, users) => {}  ) => {
            let {type ,payload} = action;

            switch(type){
                case BroadcastConstants.ROOM_ACTIONS.OnMemberRole: 
                    console.log(`ORA: test 2`)
                     this.performRoomAction(action, {memberRole: payload.value}, _callback)
                    break;
                
                case BroadcastConstants.ROOM_ACTIONS.OnMicStatus:
                    this.performRoomAction(action, {microphoneStatus: payload.value}, _callback)
                    break;
                
                case BroadcastConstants.ROOM_ACTIONS.OnBroadcastRequest:  
                    this.performRoomAction(action, {broadcastRequestStatus: payload.value}, _callback)
                    break;

                case BroadcastConstants.ROOM_ACTIONS.OnVideoStatus: 
                    this.performRoomAction(action, {videoEnabledStatus: payload.value}, _callback)
                    break;
                

                default: 
                    break;
            }
        }

        this.performRoomAction = (action, object, _callback = (error, room, users) => {} ) => {
            console.log(`ORA: test 3`)
            
            MyBroadcastMemberController.updateByUserId(action.payload.userId, object)
                .then(updatedUser => {
                    console.log(`ORA: test 7: pass`)
                    this.getRoomMembers(action.payload.roomId)
                        .then(memberIds => {
                    console.log(`ORA: test 8: members found`)
                            console.log(memberIds)
                            let act = {
                                type: action.type, 
                                payload: updatedUser
                            }
                            _callback(null, updatedUser, memberIds);
                        }).catch(err => {
                            _callback({type: action.type, error: err}, null)
                        })
                }).catch(err => {
                    _callback({type: action.type, error: err}, null)
                })
        }


        this.getRelatedMembers = (room) => {
            return new Promise((resolve, reject) => {
                if(room.tribe){
                    MyTribesController.getTribeMembers(room.tribe)
                        .then(members => {
                            resolve(members.map(m => m._id))
                        }).catch(err => {
                            reject(err)
                        })
                }else{
                    MyUserControler.getUsersWithInterest(room.interest)
                    .then(userIds => {
                        /// excluding myself
                        resolve(userIds)
                    }).catch(err => {
                        reject(err);
                    })
                }
            })
        }




        this.getActiveRoomStatus = (userId) => {
            return new Promise((resolve, reject) => {
                const res = {
                    isActive: false,
                    isBroadcaster: false,
                    activeRoomId: null, 
                    member: null, 
                    memberIds:[],
                    activeRoom: null
                }
                this.getActiveRoomByUserId(userId)
                    .then(activeRoom => {
                        if(activeRoom){
                            res.activeRoom = activeRoom;
                            res.activeRoomId = activeRoom._id;
                            if(userId === activeRoom.moderator._id.toString()){
                                 res.isBroadcaster = true;
                            }
                            
                            let memberIndex = activeRoom.members.findIndex(m => m.user._id == userId)
                            const memberIds = activeRoom.members.map(m => m.user._id);
                            res.memberIds = [...memberIds];
                            if(memberIndex >= 0){
                                res.member = {...activeRoom.members[memberIndex]}
                            }
                            res.isActive = activeRoom.isActive;
                        }
                        resolve(res);
                    }).catch(err => {
                        reject(err);
                    })
            })
        }

 







        /// @Tested
        this.createNew = (title, modratorId, interestId, description,tribe=undefined) => {
            return new Promise((resolve, reject) => {
                let newRoom = new RoomsModal({
                    roomTitle: title, 
                    members: [], 
                    moderator: modratorId, 
                    tribe: tribe, 
                    interest: interestId, 
                    description: description, 
                })
                newRoom.save()
                    .then(savedRoom => {
                        if(tribe){
                            MyTribesController.pushRoom( tribe, savedRoom._id)
                                .then(roomPushed => {
                                    resolve({room: savedRoom, success:true});
                                }).catch(err => {
                                    console.log(`CATCH Error in pushing room to tribe`)
                                    console.log(err)
                                    resolve({room: savedRoom, success:true});
                                })
                        }else{
                            resolve({room: savedRoom, success:true});
                        }
                    }).catch(err => {
                        console.log(`CATCH Error in creating room`)
                        console.log(err);
                        reject( MyErrorHandler.catchBuilder(err) )
                    })
                  
            })
        }


       this.updateRoom = (roomId, object) => {
           return new Promise((resolve, reject) => {
               if(roomId && typeof(object) === "object"){
                   RoomsModal.findByIdAndUpdate(roomId, object)
                    .then(updatedRoom => {
                        console.log(`Updated Room`)
                        resolve(updatedRoom)
                    }).catch(err => {
                        console.log(err);
                        reject(MyErrorHandler.catchBuilder(err));
                    })
               }else{
                   reject(MyErrorHandler.build("Invalid Data"))
               }
           })
       }

       /// @remove member from, BroadcastMembers, RoomMembers:Rooms, ActiveRoom:Users
       this.removeMember = (roomId, userId) => {
           console.log(`REMOVEING : RID:${roomId}, UID:${userId}`)
           return new Promise((resolve, reject) => {
               if(!(roomId && userId)){
                   reject(MyErrorHandler.build("Invalid Inputs"))
               }
               this.getById(roomId)
                .then(room => {
                    console.log(room)
                    if(room){
                        MyBroadcastMemberController.deleteByUserId(userId)  
                            .then(deletedMember => {
                                let memberIds = room.members.map(m => m.user._id)
                                console.log(`Room Member IDs`)
                                console.log(memberIds)
                                console.log(room.members)

                                room.members = room.members.filter(m => m.user._id.toString() !== userId);
                                room.save()
                                    .then(savedRoom =>{
                                        MyUserControler.updateUser(userId, {activeRoom: null})
                                        .then(savedUser => {
                                            resolve({member: deletedMember, room: savedRoom, memberIds: memberIds });
                                        }).catch(err => {
                                            console.log(`CATCH Error in updating user`)
                                            console.log(err)
                                            reject(err)
                                        })
                                    }).catch(err =>{
                                        console.log(`CATCH Error saving room`);
                                        reject(MyErrorHandler.catchBuilder(err));
                                    })
                            }).catch(err => {
                                console.log(`CATCH Error in deleting member`);
                                console.log(err)
                                room.members = room.members.filter(m => m.user._id.toString() !== userId);
                                room.save()
                                    .then(savedRoom =>{
                                        resolve(savedRoom);
                                    }).catch(err =>{
                                        console.log(`CATCH Error saving room`);
                                        reject(MyErrorHandler.catchBuilder(err));
                                    })
                            })
                    }else{
                        reject(MyErrorHandler.build("Invalid Room"))
                    }
                }).catch(err => {
                    console.log(`CATCH Error in finding room`);
                    reject(MyErrorHandler.catchBuilder(err));
                })
           })
       }
       this.flushUsersActiveRooms = (members) => {
           for (let index = 0; index < members.length; index++) {
               const memberUserId = members[index];
                MyUserControler.updateUser(memberUserId, {activeRoom: undefined})
                    .then(res =>false).catch(err => false);
           }
       }


       this.pushMember = (roomId, userId, channelId, uid, isModrator = false ) => {
         return new Promise((resolve, reject) => {
             console.log("TEST: 0")
             MyBroadcastMemberController.getByUserId(userId)
                .then(user =>{
                    if(user){
                        console.log("TEST: 1: pass user already exists")
                        reject( MyErrorHandler.build("Already member of another room"))
                    }else{
                        console.log("TEST: 2: pass")

                        this.getById(roomId)
                            .then(room => {
                                if(room){
                                    console.log("TEST: 3: pass")

                                    MyBroadcastMemberController.createNew(userId, channelId, uid ,isModrator)
                                        .then(createdMember => {
                                            console.log("TEST: 4: pass: user is")
                                            console.log(createdMember.user)
                                            room.members.push(createdMember);
                                            room.save() 
                                                .then(savedRoom => {
                                                    console.log("TEST: 5: pass")
                                                
                                                    MyUserControler.updateUser(userId, {activeRoom: roomId})
                                                        .then(savedUser => {
                                                                resolve({room: savedRoom, member: createdMember});
                                                        }).catch(err => {
                                                            console.log(`CATCH Error in updating user`)
                                                            console.log(err)
                                                            reject(MyErrorHandler.catchBuilder(err))
                                                        })  

                                                }).catch(err => {
                                                    console.log("TEST: 5: fail")
                                                    reject(MyErrorHandler.catchBuilder(err));
                                                })
                                        }).catch(err => {
                                            console.log("TEST: 4: fail")
                                            reject(err);
                                        })
                                }else{
                                    console.log("TEST: 3: invalid room")
                                    reject(MyErrorHandler.build("Invalid Room"))
                                }
                            }).catch(err =>{
                                console.log("TEST: 3: fail")

                                reject(err);
                            })
                    }
                }).catch(err => {
                    console.log("TEST: 1: fail")

                    reject(err);
                })
         })
       }

       this.delete = (roomId) => {
            return new Promise((resolve, reject) => {
                if(roomId){
                    this.getById(roomId)
                        .then(room => {
                            if(room){
                                RoomsModal.deleteOne({_id: roomId})
                                .then(deleted => {
                                    console.log(`Room deleted`)
                                    console.log(deleted)
                                    resolve({room:room._doc});
                                }).catch(err => {
                                    reject( MyErrorHandler.catchBuilder(err) )
                                })
                            }else{  
                                reject(MyErrorHandler.build("Invalid Room"))
                            }
                        }).catch(err =>{
                            reject(err)
                        })
                 
                }else{
                    reject(MyErrorHandler.build("Invalid RoomId"))
                }
            })
       }

       this.getById = (roomId) => {
           return new Promise((resolve, reject) => {
               RoomsModal.findById(roomId).populate("members").populate("moderator").populate({path: "members", populate: {path: "user", modal: "tblusers"}})
                .then(room => {
                   resolve(room);
                }).catch(err =>{    
                    reject(MyErrorHandler.catchBuilder(err));
                })
           })
       }
    
       this.getAll = () => {
           return new Promise((resolve, reject) => {
            RoomsModal.find().populate("members").populate("moderator")
                .then(rooms => {
                    resolve(rooms);
                }).catch(err => {
                    reject(MyErrorHandler.catchBuilder(err));
                })
           })
       }
       this.getRoomsByUserInterests = (userId) => {
            return new Promise((resolve, reject) => {
                
                MyUserControler.getUserInterests(userId)
                    .then(interests => {
                        RoomsModal.find({interest: {"$in": interests}, isActive:true, tribe: undefined}).populate("members").populate("moderator").populate({path: "members", populate: {path: "user", modal: "tblusers"}})
                            .then(rooms => {
                                resolve(rooms)
                            }).catch(Err => {
                                reject(MyErrorHandler.catchBuilder(Err))
                            })
                    }).catch(err => {
                       reject(err)
                    })
            } )
       }
       this.getActiveRoomsByTribes = (userId) => {
           return new Promise((resolve, reject) => {
                MyTribesController.getUserJoinedTribeIds(userId)
                    .then(tribes => {
                        RoomsModal.find({tribe: {"$in": tribes}, isActive:true}).populate("members").populate("moderator").populate({path: "members", populate: {path: "user", modal: "tblusers"}})
                        .then(rooms => {
                            resolve(rooms)
                        }).catch(Err => {
                            console.log(`CATCH Error in getting rooms`)
                            reject(MyErrorHandler.catchBuilder(Err))
                        })
                    }).catch(err => {
                        console.log(`CATCH Error in getting tribes`)
                        console.log(err)
                        resolve(err)
                    })
           })
       }
       this.getAllActiveRooms = () => {
        return new Promise((resolve, reject) => {
            RoomsModal.find({isActive:true, tribe: undefined}).populate("members").populate("moderator").populate({path: "members", populate: {path: "user", modal: "tblusers"}})
                .then(rooms => {
                    resolve(rooms)
                }).catch(Err => {
                    reject(MyErrorHandler.catchBuilder(Err))
                })
        } )
   }
       this.getRoomsCreatedByUser = (userId) => {
            return new Promise((resolve, reject) => {
                RoomsModal.find({moderator: userId})
                    .then(rooms => {
                        resolve({rooms, success:true})
                    }).catch(Err => {
                        reject(MyErrorHandler.catchBuilder(Err))
                    })
                  
            } )
       }
       this.getRoomMembers = (roomId) =>{
            return new Promise((resolve, reject) => {
                this.getById(roomId)
                    .then(room => { 
                        let memberIds = room.members.map(m => m.user._id)
                        resolve(memberIds);
                    }).catch(err =>{
                        reject(err);
                    })
            })
       }

       this.getActiveRoomByUserId = (userId) => {
           return new Promise((resolve, reject) => {
                MyUserControler.getUserById(userId)
                    .then(user => {
                        if(user){
                            let roomId = user.activeRoom;
                            this.getById(roomId)
                                .then(room => {
                                    resolve(room);
                                }).catch(err => {
                                    reject(err);
                                })
                        }else{
                            reject(MyErrorHandler.build("Invalid User"))
                        }  
                    }).catch(err => {
                        reject(err);
                    })
           })
       }

       this.varifyUsersPrivilageToRoom = (userId, roomId) => {
           return new Promise((resolve ,reject) => {
                //// #1: Room must be active.
                this.getById(roomId)
                    .then(activeRoom => {
                        if(activeRoom){
                            if(activeRoom.isActive){
                                resolve(true) /// Allowed: to join room
                            }else{
                                reject(MyErrorHandler.build("Room not active")) /// Blocked: access to inactive room;
                            }
                        }else{
                            reject(MyErrorHandler.build("Invalid Room")) /// Blocked: Cannot access unavailable room;
                        }
                    }).catch(Err => {
                        reject(MyErrorHandler.build("Invalid Room: not found error")) ///Blocked: Interneal server error;
                    }) 
           })
       }



    }
}
const MyRoomsController = new RoomsController();
module.exports = MyRoomsController;