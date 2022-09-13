const MyUserControler = require("../User");
const BroadcastConstants = require("./constants");
const MyRoomsController = require("./roomsController");
const schedule = require('node-schedule');

class BroadcastExeptionsHandler{
     constructor(_context){
        const context = _context;
        const MEMBER_WAITING_TIME = 5;


        const handleRemoveMember = (roomId, userId, members) => {
            MyRoomsController.removeMember(roomId, userId)
            .then(rmMemberRes => {
                /// broadcast
                context.broadcast("onRoomMemberLeave", rmMemberRes, members)
            }).catch(err => {
                console.log(err);
                ///
            })
        }
        const handleDeintegrateUserActiveRoom = (userId) => {
            MyUserControler.updateUser(userId, {activeRoom: null})
                .then(updatedUser => {
                    console.log(updatedUser)
                }).catch(err => {
                    console.log(err);
                })
        }
       
        const handleBroadcasterDisconnect =(userId, roomId) => {

        }


        const handleMemberDisconnect = (userId_, roomId_) => {
            const currentDate = new Date();
            let pData = JSON.stringify({userId: userId_, roomId: roomId_});
            currentDate.setSeconds(currentDate.getSeconds() + MEMBER_WAITING_TIME);
            console.log(`MD-TEST:01, schedualing removeal at ${currentDate.toTimeString()}`)
            const job = schedule.scheduleJob(currentDate, function(mData){
                console.log(`MD-TEST:02, Schedual is running`)
                const {userId, roomId} = JSON.parse(mData);
                console.log(`MD-TEST:03, userId:${userId}, RoomId:${roomId}`)
                MyRoomsController.getActiveRoomStatus(userId)
                    .then(res => {
                        console.log(`MD-TEST:04, taken active room status`)
                        if(res.isActive){ /// is room active
                            console.log(`MD-TEST:05, taken room is active`)
                            if(roomId == res.activeRoomId){ /// has not joined any other room ?
                                console.log(`MD-TEST:06, has not joined any other room yet`)
                              let foundUserSocket =  context.find(userId);
                              if(foundUserSocket){ /// is member online
                                console.log(`MD-TEST:07, socket found`)
                                console.log(foundUserSocket)
                                 /// check on room if user is online. ?
                                 if(res.member){ /// did member exist
                                    console.log(`MD-TEST:08, member also exist as broadcaster`)
                                    if(res.member.onlineStatus === BroadcastConstants.ONLINE_STATUS.ONLINE){ /// is member online in room
                                        console.log(`MD-TEST:09, member is again online in room so things are well`)
                                        /// do nothing mean room is running and user is in communication.
                                    }else{ 
                                        /// mean: member is offline in room
                                        /// TODO:Remove Member ->A
                                        console.log(`MD-TEST:09, member is not online in room, removing...`)
                                        handleRemoveMember(roomId, userId, res.memberIds);
                                    }
                                 }else{
                                     /// mean: member is deleted but roomId is still attached
                                     /// TODO: remove roomId from user. ->B
                                     console.log(`MD-TEST:08, member not found in broadcasters so deintegrating room`)
                                     handleDeintegrateUserActiveRoom(userId)
                                 }
                              }else{
                                /// mean: user is offline but still attached to room
                                /// TODO:Remove Member ->A
                                console.log(`MD-TEST:07, member is offline but attached to room so, deintegrating it`)
                                handleRemoveMember(roomId, userId, res.memberIds);
                              }
                            }else{
                                console.log(`MD-TEST:06, member seems subscribed to another room`)
                                console.log(`${roomId} == ${res.activeRoomId}`)
                                ///if here: it mean he subscribed to another room, 
                                ///do nothing.
                            }
                        }else{
                            console.log(`MD-TEST:05, room is offline now`)
                            /// mean: Room is offline now but is still attached to user
                            /// remove roomId from User. ->B
                            handleDeintegrateUserActiveRoom(userId)
                        }
                    }).catch(err => {
                        console.log(`CATCH Error in getting active room status`)
                        console.log(err);
                    })
            }.bind(null,pData));
        }




        this.handleRoomMemberDisconnect = (userId) => {
            console.log(`DR-TEST:01, On User Disconnect ${userId}`)
            MyRoomsController.getActiveRoomStatus(userId)
                .then(res => {
                    console.log(`DR-TEST:02`)
                    if(res.activeRoomId){
                        console.log(`DR-TEST:03, attached room exist in member`)
                        if(res.isActive){
                            console.log(`DR-TEST:04, attached room is active`)
                            if(res.isBroadcaster){
                                console.log(`DR-TEST:05, member role is Broadcaster`)
                                handleBroadcasterDisconnect(userId, res.activeRoomId)                                
                            }else{
                                console.log(`DR-TEST:05, member role is Audiance`);
                                handleMemberDisconnect(userId, res.activeRoomId);
                            }
                        }else{
                            console.log(`DR-TEST:04, attached room not active`)
                            /// TODO:remove activeRoomId from user
                        }
                    }else{
                        console.log(`DR-TEST:03, no room is attached`)
                        /// do nothing
                    }
                }).catch(err => {
                    console.log(`DR-TEST:02, fail, CATCH Error in geting ActiveRoomStatus`)
                    console.log(err);
                })
        }
    }   
}
// const abc = new BroadcastExeptionsHandler("a")
module.exports = BroadcastExeptionsHandler;