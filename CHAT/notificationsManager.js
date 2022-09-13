// const serviceAccount = require("../awsocialapp-firebase-adminsdk-b3kl8-6c2a4be9f6.json");
const { UserModal } = require('../Modals');

// const FirebaseAdmin = require("firebase-admin");
// FirebaseAdmin.initializeApp({
//     credential: FirebaseAdmin.credential.cert(serviceAccount)
//   });

// awsocialapp-firebase-adminsdk-b3kl8-6c2a4be9f6.json
class NotificationsManager{
    constructor(){
    
        this.sendVoipNotification = (userId, action) => {
            return new Promise((resolve, reject) => {

                this.getUserTokens(userId).then(tokens =>{
                    console.log(">Tokens Generated ")
                    console.log(tokens)
                    const message = {
                        notification: {
                            title: "AWSOCIAL TEST",
                            body: "TEST NOTIFY, AWSOCIAL", 
                        }, 
                        data: {

                            type: action?.type, 
                            payload:  action?.payload? JSON.stringify(action.payload): ""
                        }
                    }
                    const opts = {
                        priority: "high",
                        timeToLive: 60 * 60 *24
                      }
                      this.pushNotificaitons(tokens, message, opts)
                      .then(nres => resolve(nres)).catch(err => reject(err))
                }).catch(err =>{
                    reject(`SendNotification: ${err}`);
                })
            })
        }
     
        this.pushNotificaitons = (deviceTokens, payload, notifyTokens) =>{
            return new Promise((resolve, reject) => {
                // FirebaseAdmin.messaging()
                //     .sendToDevice( deviceTokens , payload, notifyTokens)
                //      .then(response => {
                //         console.log(`>Notification Sent Successfully`);
                //         console.log(response.results[0].error)
                //         resolve(true)
                // }).catch(err => {
                //     console.log("CATCH, Error in sending notification");
                //     console.log(err);
                //     reject(err);
                // })
            })
        }
      

        this.getUserTokens = (userId) => {
            console.log(`>Get User, Token:${userId}`);
            return new Promise((resolve, reject) => {
                UserModal.findById(userId)
                    .then(user =>{
                        console.log(user)
                        if(user){
                            console.log("Tokens")
                            let mTokens = user.notifyTokens.map(t => t.notifyToken);
                            
                            console.log(mTokens)
                            resolve(mTokens);
                        }else{
                            reject("Invalid User");
                        }
                    }).catch(err =>{
                        console.log("CATCH, getUserToken, NotificationsManager");
                        console.log(err);
                        reject("Failed to get User")
                    })
            })
        }
    }
}
module.exports = NotificationsManager;