const MyRoomsController = require("../roomsController");
const MyRTEmitter = require("./rtEmitter");

class SingleSocket{
    constructor(uid, socket, context){
        this.uid = uid;
        this.socket = socket;
        this.context = context;

        this.TYPES = {
            OnNewRoomHosted: "onNewRoomHosted", 
            OnNewRoomMemberJoin: "onNewRoomMemberJoin", 
            OnRoomMemberLeave: "onRoomMemberLeave", 
            OnRoomEnd: "onRoomEnd", 
            OnRoomAction: "onRoomAction"
        }

        this.broadcast = (type, payload ,audiance_) => {
            console.log(`=>TEST9: Broadcasting ${type}`)
            let audiance = JSON.parse(JSON.stringify(audiance_))
            let audianceSockets = this.context.findByArray(audiance)
            console.log(`TEST10: Found Sockets #${audianceSockets.length}`)
            for(let index = 0; index < audianceSockets.length; index++){
                console.log(`Broadcasting to ${audianceSockets[index].uid}`)
                global.broadcastIO.to(audianceSockets[index].socket.id).emit(type, {query: payload})
            }
        }




        this.socket.on("onHostedRoom", (req, ack) => {
            let query = req.query;
            MyRoomsController.onRoomHosted(
                query.userId, query.roomId, query.channelName, query.uid, 
                (error, room, users) => {
                    ack({error, data: room})
                    if(!error){
                        console.log(`TEST8: pass`)
                        this.broadcast(this.TYPES.OnNewRoomHosted, room, users)
                    }
                } )
        })

        this.socket.on("onJoinNewRoomMember", (req, ack) => {
            let query = req.query;
            MyRoomsController.onNewRoomMember(
                query.userId, query.roomId, query.channelName, query.uid,
                (error, joinRoomRes, users) => {
                    ack({error, data: joinRoomRes })
                    if(!error){
                        console.log(`TEST8: pass`)
                        this.broadcast(this.TYPES.OnNewRoomMemberJoin, joinRoomRes, users)
                    }
                }
            )
        })

        this.socket.on("onLeaveRoomMember", (req, ack) => {
            let query = req.query;
            MyRoomsController.onRoomMemberLeave(
                query.userId, query.roomId, 
                (error, leavingMember, users) => {
                    ack({error, data: leavingMember})
                    if(!error){
                        console.log(`TEST8: pass`)
                        this.broadcast(this.TYPES.OnRoomMemberLeave, leavingMember, users)
                    }
                }
            )
        })

        this.socket.on("onEndRoom", (req, ack) => {
            let query = req.query;
            MyRoomsController.onRoomEnd(
                query.roomId, 
                (error, room, users) => {
                    ack({error, data: room})
                    if(!error){
                        console.log(`TEST8: pass`)
                        this.broadcast(this.TYPES.OnRoomEnd, query.roomId, users)
                    }
                }
            )
        })  


        this.socket.on("onRoomAction", (req, ack) => {
            let action = req.query;
            console.log(`ORA: test 1`)
            console.log(action);
            MyRoomsController.onRoomAction(
                action
                , (error, room, users) => {
                    ack({error, room})
                    if(!error){
                        this.broadcast(this.TYPES.OnRoomAction, action, users)
                    }
                })
        })

        



    }
}
module.exports = SingleSocket;