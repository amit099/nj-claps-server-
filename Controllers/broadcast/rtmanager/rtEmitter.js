const MySocketStore = require("./socketStore");

class RTEmitter{
    constructor(){
        this.TYPES = {
            OnNewRoomHosted: "onNewRoomHosted", 
            OnNewRoomMemberJoin: "onNewRoomMemberJoin", 
            OnRoomMemberLeave: "onRoomMemberLeave", 
            OnRoomEnd: "onRoomEnd", 
            OnRoomAction: "onRoomAction"
        }

        this.ROOM_ACTIONS = {
            OnMicStatus: "onMicStatus", 
            OnMemberRole: "onMemberRole", 
            OnBroadcastRequest: "onBroadcastRequest", 
        }

        /// @audiance will be array of user's ids existing in tblusers
        this.broadcast = (type, payload ,audiance) => {
            console.log(`=>Broadcasting ${type}`)
           let audianceSockets = MySocketStore.findByArray(audiance)
           console.log(`Found Sockets #${audianceSockets.length}`)
           for(let index = 0; index < audianceSocket.length; index++){
               
               global.broadcastIO.to(audianceSockets.socket.id).emit(type, {query: payload})
           }
        }
    }   
}
const MyRTEmitter = new RTEmitter();




module.exports = MyRTEmitter;