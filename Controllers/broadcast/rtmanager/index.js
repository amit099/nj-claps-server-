const MySocketStore = require("./socketStore");

class RTManager{
    constructor(){
        this.ROOM_ACTIONS = {
            OnMicStatus: "onMicStatus", 
            OnMemberRole: "onMemberRole", 
            OnBroadcastRequest: "onBroadcastRequest", 
        }
        this.join = MySocketStore.add;
        this.leave = MySocketStore.remove;
    }   
}
const MyRTManager = new RTManager();




module.exports = MyRTManager;