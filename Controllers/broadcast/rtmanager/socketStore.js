const SingleSocket = require("./singleSocket");
const BroadcastExeptionsHandler = require("../broadcastExceptionsHandler")

class SocketStore{
    constructor(){

        const broadcastExeptionsHandler = new BroadcastExeptionsHandler(this)
        let sockets = [];
        this.add = (uid,socket) => {
            // this.onMemberConnect(uid)
            sockets = sockets.filter(s => s.uid !== uid);
            sockets.push(new SingleSocket(uid, socket, this))
        }

        this.remove = (uid) => {
            console.log(`${uid}: Braodcaster Disconnected`)
            this.onMemberDisconnect(uid)
           
            // let sIndex = sockets.findIndex(s => s.uid === uid);
            // if(sIndex !== -1){
              
            //     // sockets[sIndex].socket.disconnect();
            //     console.log(`===>ABOUT TO REMOVE SOCKET`)
            //     // console.log(sockets[sIndex])
            //     // sockets = sockets.filter(s => s.uid !== uid);
            // }else{
            //     console.log("Socket not found to remove")
            // }
        }



        this.find = (uid) => {
            let socketIndex = sockets.findIndex(s => s.uid === uid);
            if(socketIndex >= 0){
                return sockets[socketIndex];
            }else{
                return false;
            }
        }

        this.findByArray = (uids) => {
            console.log(`Searcing against ids`)
            console.log(uids);
            return sockets.filter(s => uids.includes(s.uid))
        }

        this.broadcast = (type, payload ,audiance_) => {
            console.log(`=>TEST9: Broadcasting ${type}`)
            let audiance = JSON.parse(JSON.stringify(audiance_))
            let audianceSockets = this.findByArray(audiance)
            console.log(`TEST10: Found Sockets #${audianceSockets.length}`)
            for(let index = 0; index < audianceSockets.length; index++){
                console.log(`Broadcasting to ${audianceSockets[index].uid}`)
                global.broadcastIO.to(audianceSockets[index].socket.id).emit(type, {query: payload})
            }
        }

        this.onMemberConnect = (uid) => {

        }
        
        this.onMemberDisconnect = (uid) => {
            // broadcastExeptionsHandler.handleRoomMemberDisconnect(uid)
        }

    }   
}
const MySocketStore = new SocketStore();
module.exports = MySocketStore;