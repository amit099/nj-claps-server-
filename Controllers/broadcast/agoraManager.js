const MyBroadcastMemberController = require("./broadcastMemberController");
const MyRoomsController = require("./roomsController");
const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-access-token')
class AgoraManager{
    constructor(){

        this.getAvailableAppId = () => {
            return "af7ff27308964b0b8cc758cec23051fc";
        }
        this.getAppCertificate = () => {
            return "6ab2f2f2a1ac43ce97ef18e1a4d213e8"
        }


        this.generateToken = (uid, channelName) => {
            const appID = this.getAvailableAppId();
            const appCertificate = this.getAppCertificate();
            const role = RtcRole.PUBLISHER;

            const expirationTimeInSeconds = 3600
 
            const currentTimestamp = Math.floor(Date.now() / 1000)
            
            const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
            
            const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
            console.log(`Token With Integer Number Uid:${uid}, ChannelName: ${channelName} ` + tokenA);

            return {token: tokenA, appId: appID};
        }

        this.generateBroadcastHostingCredencials = () => {
            return new Promise((resolve, reject) => {
                MyBroadcastMemberController.generateValidUID32Bit()
                    .then(({uid}) => {
                        // let dUID = 2882341273
                        /// uid & channelName generate
                        // let uid = MyBroadcastMemberController.generateUID32Bit();
                        let channelName = MyBroadcastMemberController.getUUID();
                        /// get agora token
                        let {token, appId} = this.generateToken(uid, channelName)
                        resolve ({
                            appId,
                            token,
                            uid,
                            channelName
                        })
                    }).catch(err => {
                        reject(err)
                    })
            })      
        }
        this.generateAudianceCredencials = (channelName) =>{
            return new Promise((resolve, reject) => {
                MyBroadcastMemberController.generateValidUID32Bit()
                    .then(({uid}) => {
                        /// get agora token
                        let {token, appId} = this.generateToken(uid, channelName)
                        resolve ({
                            appId,
                            token,
                            uid, 
                            channelName
                        })
                    }).catch(err => {
                        reject(err)
                    })
            }) 
        }
        

    }
}
const MyAgoraManager = new AgoraManager();
module.exports = MyAgoraManager;