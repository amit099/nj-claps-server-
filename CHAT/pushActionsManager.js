const {UserModal} = require('../Modals')
class PushActionsManager{
    constructor(userId){
        this.userId = userId;



        this.pushAction = (type, payload, uid=this.userId ,datetime = Date.now(), _id=null) => {
            return new Promise((resolve, reject) => {
                console.log("TEST 01, pushActions")
                console.log(`UID: ${uid}`);
                console.log(uid);

                UserModal.findById(uid)
                .then(user => {
                  if(user){

                    if(_id){
                        user.pushActions.push({
                            _id,
                            pushType: type,
                            payload: JSON.stringify(payload),
                            datetime: datetime
                        })
                    }else{
                        user.pushActions.push({
                            pushType: type, 
                            payload: JSON.stringify(payload),
                            datetime: datetime
                        })
                    }
                    user.save().then(sUser => {
                        console.log("CREATED PUSH")
                        let pushedAction  =sUser.pushActions[sUser.pushActions.length-1];
                        console.log(pushedAction);
                        let action = {
                            _id: pushedAction._id, 
                            payload: JSON.parse(pushedAction.payload), 
                            pushType: pushedAction.pushType
                        }
                        resolve(action);
                    }).catch(err => {
                        console.log("error saving");
                        reject(err);
                        console.log(err);
                    })
                }else{
                    console.log("TEST 02, ELSE")
                    console.log(this.userId)
                    reject(`User ${this.userId} not found`)
                }
                }).catch(err => {
                    console.log("USER FOUND ERROR");
                    console.log(err);
                    reject(err);
                })
            })
        }
        this.pushGroupActions = (type, payload, users, datetime = Date.now()) => {
            return new Promise( async (resolve, reject) => {
                try {
                    let firstPush = await this.pushAction(type, payload, users[0], datetime)
                    for (let index = 1; index < users.length; index++) {
                        const userId = users[index];
                         await this.pushAction(type, payload, userId, datetime, firstPush._id);
                    }
                    resolve(firstPush._id);
                } catch (error) {
                    reject(error);
                }
            })
        }

        this.removePushAction = (id) => {
            return new Promise((resolve, reject) => {
                UserModal.findById(this.userId)
                    .then(user => {
                        let pushes = user.pushActions.filter(a => a._id.toString() != id.toString())
                        user.pushActions = pushes;
                        UserModal.updateOne({_id: this.userId}, {pushActions: pushes})
                        .then(sUser =>{
                                console.log("DELETED: "+id)
                                resolve({removed: true, _id: id});
                            }).catch(err => {
                                console.log("ERROR DELETING: "+id)
                                reject({removed: false, _id: id});
                            })
                    }).catch(err => {
                        console.log("ERROR: finding user")
                        reject({removed: true, _id:id});
                    })
            })
        }
        this.removePushActions =  (pushes) => {
            return new Promise( async (resolve, reject) => {
                let resPush = []
                for (let index = 0; index < pushes.length; index++) {
                    const sPush = pushes[index];
                    let res = await this.removePushAction(sPush._id);
                    resPush.push(res);
                }
                resolve(resPush);
            })
        }
        this.getPushes = () => {
            return new Promise((resolve, reject) => {
                console.log("TEST 01: USER ID ")
                console.log(this.userId)
                UserModal.findById(this.userId)
                .then(user => {
                    if(user){
                    let pushes = [];
                    for (let index = 0; index < user.pushActions.length; index++) {
                        const mpush = user.pushActions[index];
                        // mpush.payload = JSON.parse(mpush.payload);
                        // console.log(mpush.payload);
                        pushes.push({
                            _id: mpush._id ,
                            pushType: mpush.pushType,
                            payload: JSON.parse(mpush.payload)
                        });
                    }
                    resolve(pushes);
                }else{
                    console.log("TEST 02, ELSE")
                    console.log(user)
                    reject(`User ${this.userId} not found`)
                }
                }).catch(err => {
                    console.log("GETTING PUSHES: ERROR")
                    console.log(err);
                    reject(err);
                })
            })
        }
    }
}

module.exports = (userId) => {
    return new PushActionsManager(userId);
}