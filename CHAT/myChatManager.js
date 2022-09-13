const {UserModal, UserChatModal, MessageModal} = require("../Modals/index")
const mongoose = require("mongoose");
const ChatDataAdapter = require("./chatDataAdapter")
const UserManagerObj = require("./usersManager");
const MyUserDataAdapter = require("./userDataAdapter");

const UserManager = new UserManagerObj();
class MyChatManager{
    static USER_NOT_FOUND = 0;
    static CHAT_NOT_FOUND = 1;
    static USER_CHAT_FOUND = 2;


    constructor(){
        this.initializeChat = (users) => {
            return new Promise((resolve, reject) => {
                this.chatExists(users)
                    .then(({success, value}) => {
                        if(success){
                            this.initialiazeCoupleUsers(users, value._id)
                            .then((result) => {
                                resolve({ users: result, chat: value});
                            }).catch(err => {
                                reject(err);
                            })
                        }else{
                            console.log("CHAT NOT FOUND")
                            this.createChat(users, "single")
                                .then(chatResult => {
                                    if(chatResult.success){
                                        this.initialiazeCoupleUsers(users, chatResult.value._id)
                                        .then((result) => {
                                            resolve({users: result, chat: chatResult});
                                        }).catch(err => {
                                            reject(err);
                                        })
                                    }else{
                                        reject("create chat error")
                                    }
                                  
                                }).catch(err => {
                                    reject(err);
                                })
                        }
                    }).catch(err => {
                        reject(err);
                    })
            })
        }

        this.initialiazeCoupleUsers = (users, chatId) =>{ 
            return new Promise((resolve, reject) => {
                this.initiazlieChatObject(users[0], chatId)
                .then(u1 => {
                    this.initiazlieChatObject(users[1], chatId)
                        .then(u2 => {
                            resolve([u1, u2]);
                        }).catch(err => {
                            reject(err);
                        })
                }).catch(err => {
                    reject(err);
                })
            })
        }

        this.getAllChat = () => {
            return new Promise((resolve, reject) => {
                UserChatModal.find()
                    .then(chat => resolve(chat)).catch(err => reject(err));
            })
        }

        this.chatExists = (users) => {
            return new Promise((resolve, reject) => {
                // console.log("-----------CHAT USERS----------")
                // console.log(users);
                let mUsers = [...users];
                // console.log(users.reverse())
                UserChatModal.findOne({$or: [{users:  users}, {users: mUsers.reverse()}]})
                    .then(userChat => {
                        console.log("RESULT: ")
                        console.log(userChat);
                        if(userChat){
                            resolve({success: true, value: userChat});
                        }else{
                            resolve({success: false, value: userChat});
                        }   
                    }).catch(err => {
                        reject(err);
                    })
            })
        }
        
        
      
        this.createChat  = (users, chatType) => {
            return new Promise((resolve, reject) => {
                if(users.length === 2){
                    let userChat = new UserChatModal({
                        users: users, 
                        chatType: chatType
                    })
                    userChat.save()
                        .then(sUserChat => {
                            resolve({success: true, value: sUserChat});
                        }).catch(err => {
                            console.log("CATCH: CREATE CHAT ERROR")
                            console.log(err);
                            reject(err);
                        })
                }else{
                    console.log("invalid length")
                    resolve({success: false, msg: "invalid users: length must be two"})
                }
            })
        }

        this.initiazlieChatObject = (userId, cid) => {
           return new Promise((resolve, reject) => {
                UserModal.findById(userId)
                    .then(oUser =>{
                        let index = oUser.userChat.findIndex(c => c.toString() ==  cid);
                        if(index >= 0){
                            console.log("ALREADY INITIALIZED")
                            resolve(oUser)
                        }else{
                            oUser.userChat.push(cid)
                            oUser.save()    
                                .then(nUser => {
                                    resolve(nUser);
                                }).catch(err => {
                                    console.log("CATCH: INITIALIZE CHAT OBJECT")
                                    console.log(err);
                                    reject(err);
                                })
                           
                        }
                    }).catch(err =>{
                        console.log("CATCH: INITIALIZE CHAT OBJECT")
                        console.log(err);
                        reject(err); 
                    })       
           })
        }
        this.uninitializeChatObject = (userId, cid) => {
            return new Promise((resolve, reject) => {
                UserModal.findById(userId)
                    .then(oUser =>{
                        let userChat = oUser.userChat.filter(c => c.toString() !=  cid);
                            oUser.userChat = userChat;
                            oUser.save()    
                                .then(nUser => {
                                    resolve(nUser);
                                }).catch(err => {
                                    console.log("CATCH: INITIALIZE CHAT OBJECT")
                                    console.log(err);
                                    reject(err);
                                })
                      
                    }).catch(err =>{
                        console.log("CATCH: INITIALIZE CHAT OBJECT")
                        console.log(err);
                        reject(err); 
                    })       
           })
        }
        this.pushMessage = (chatId, message) => {
            return new Promise((resolve, reject) => {
                UserChatModal.findById(chatId)
                    .then(chat => { 
                        if(chat){
                            let newMessage = new MessageModal({
                                from: message.from, 
                                to: message.to,
                                body: message.body,
                                status: message.status, 
                                messageType: message.messageType, 
                                sentTimeDate: message.sentTimeDate, 
                                seetTimeDate: message.seenTimeDate
                            })
                            chat.messages.push(newMessage)
                            chat.lastMessageDate = message.sentTimeDate
                            chat.save() 
                                .then(sChat => {
                                    resolve({success: true, value: sChat});
                                }).catch(err => {
                                    reject({success: false, error: err});
                                })
                        }else{
                            resolve({success: false, error: "chat not found"});
                        }
                    }).catch(err => {
                        reject(err);
                    })
            })
        }

        this.updateMessage = (cid, message) => {
            return new Promise((resolve, reject) => {
                UserChatModal.findById(cid)
                    .then(userChat => {
                        let mIndex = userChat.messages.findIndex(m => m._id.toString() == message._id);
                        if(mIndex >= 0){
                            userChat.messages[mIndex].status = message.status; 
                            userChat.messages[mIndex].seenTimeDate = message.seenTimeDate;
                            userChat.save()
                            .then(sUserChat => {
                                console.log("USER CHAT SAVED...............")
                                console.log(sUserChat);
                                resolve(sUserChat)
                                
                            }).catch(err => {
                                console.log("USER CHAT SAVEDING ERROR")
                                console.log(err);
                            })
                        }else{  
                            console.log("Invalid Message: updateMessage");
                        }
                    }).catch(err => {
                        console.log("CATCH: updateMessage");
                        console.log(err);
                        reject(err);
                    })
            })
        }

        this.getChat = (cid, uid) => {
            return new Promise((resolve, reject) => {
                UserChatModal.findOne({cid: cid}).populate({path: "messages"}).populate({path: "users"})
                .then(chat => {
                    console.log("found chat")
                    console.log(chat);
                   if(chat){
                       resolve({success: true, value: ChatDataAdapter(uid).transformSingleUserChat(chat)})
                   }else{
                       reject({success:false, value: null});
                   }
                }).catch(err => {
                    console.log("CATCH Error, getting Chat");
                    console.log(err);
                    reject({success:false, value:null})
                })
            })
        }



        this.prepareChatObjects = (userId, users) => {
            return new Promise( async (resolve, reject) => {
                try {
                    let usersChat = [];
                    for (let index = 0; index < users.length; index++) {
                        const singleUser = users[index];
                        let uRes = await UserManager.userExists(singleUser.phoneNumber);
                        /// if user exists
                        if(uRes.success){
                            // -
                            // let mUser = {_id: uRes.value._id, phoneNumber: uRes.value.phoneNumber, username: uRes.value.username, thumbnail: uRes.value.thumbnail, imageUrl: uRes.value.imageUrl}
                            let mUser = MyUserDataAdapter.toPublicJSON(uRes.value);
                            /// exists: check if chat exists  
                            let cRes = await this.chatExists([userId, uRes.value._id.toString()]);
                            console.log("C RES");
                            console.log(cRes);
                            if(cRes.success){
                                /// exists: attach full chat and push to array
                                usersChat.push({
                                    chatStatus: MyChatManager.USER_CHAT_FOUND, 
                                    user: mUser,
                                    chat: ChatDataAdapter(userId).transformSingleUserChat(cRes.value), 
                                })
                            }else{
                                /// chat not exist: push null with status
                                usersChat.push({
                                    chatStatus: MyChatManager.CHAT_NOT_FOUND, 
                                    user: mUser,
                                    chat: null
                                })
                            }
                        }else{
                            //// user not exists 
                            usersChat.push({
                                chatStatus: MyChatManager.USER_NOT_FOUND, 
                                user: singleUser,
                                chat: null
                            })
                        }
                    }
                    let newUsers = usersChat.filter(uc => uc.user._id != userId);
                    // console.log(`Current User Id ${userId}`)
                    // console.log(`Prepared Contacts`)
                    // console.log(newUsers)
                    resolve(newUsers);
                } catch (error) {
                    console.log("CATCH: Prepare Chat")
                    reject(error)
                }
            })
        }

//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////@ Group Chat Management/////////////////////////////////// 
//////////////////////////////////////////////////////////////////////////////////////////////////
//// 
        
        this.initializeGroupChat = (creator, members, title, description = "") => {
            return new Promise((resolve, reject) => {
                let userGroupChat = new UserChat({
                    users: members, 
                    admins: [creator], 
                    title: title, 
                    description: description, 
                    lastMessageDate: Date.now(), 
                    chatType: "group"
                })
                userGroupChat.save()
                    .then( async cGroupChat => {
                            for (let index = 0; index < members.length; index++) {
                                const userId = members[index];
                                await this.initiazlieChatObject(userId, cGroupChat._id);
                            }
                            resolve(cGroupChat)
                    }).catch(err => {
                        reject(err);
                    })
            })
        }
        

        this.addNewGroupMember = (memberId, maker, groupId) => {
            return new Promise((resolve, reject) => {
                this.isGroupAdmin(maker, groupId)
                .then(result => {
                    if(result.success){
                        this.isMember(memberId, groupId)
                            .then(result => {
                                if(!result.success){
                                    result.value.users.push(memberId);
                                    result.value.save()
                                        .then(sUserChat => {
                                            this.initiazlieChatObject(memberId, groupId)
                                                .then(result =>{
                                                    resolve({success: true, value: sUserChat});
                                                }).catch(err => {
                                                    resolve(err);
                                                })
                                            /// TODO: save action that, "maker" make "memeberId" member of "groupId"
                                        }).catch(err => {
                                            reject(err)
                                        })
                                }else{
                                    resolve(result);
                                }
                            }).catch(err =>{
                                reject(err);
                            })
                    }else{
                        resolve(result);
                    }
                }).catch(err => {
                    reject(err);
                })
            })
        }

        this.removeGroupMember = (memberId, remover, groupId) => {
            return new Promise((resolve, reject) => {
                this.isGroupAdmin(remover, groupId)
                    .then(result => {
                        if(result.success){
                            this.isMember(memberId, groupId)
                                .then(result =>{
                                    if(result.success){
                                        let users = result.value.users.filter(u => u.toString() != memberId);
                                        result.value.users = users;
                                        result.value.save()
                                            .then(sGroupChat =>{
                                                this.uninitializeChatObject(memberId, groupId)
                                                    .then(result =>{
                                                        resolve({success: true, value: sGroupChat});
                                                    }).catch(err => {
                                                        reject(err);
                                                    })
                                            }).catch(err =>{
                                                reject(err);
                                            })
                                    }else{
                                        resolve(result);
                                    }
                                }).catch(err => {
                                    reject(err);
                                })
                        }else{
                            resolve(result);
                        }
                    }).catch(err => {
                        reject(err);
                    })
            })
        }


        this.makeGroupAdmin = (memberId, maker, groupId) => {
            return new Promise((resolve, reject) => {
                this.isGroupAdmin(maker, groupId)
                .then(result => {
                    if(result.success){
                        this.isGroupAdmin(memberId, groupId)
                            .then(result => {
                                if(!result.success){
                                    this.addNewGroupMember(memberId, maker, groupId)
                                        .then(result => {
                                            result.value.admins.push(memberId);
                                                result.value.save()
                                                    .then(sUserChat => {
                                                        resolve({success: true, value: sUserChat});
                                                        /// TODO: save action that, "maker" make "memeberId" member of "groupId"
                                                    }).catch(err => {
                                                        reject(err)
                                                    })
                                        }).catch(err => {
                                            reject(err);
                                        })
                                  
                                }else{
                                    resolve(result);
                                }
                            }).catch(err =>{
                                reject(err);
                            })
                    }else{
                        resolve(result);
                    }
                }).catch(err => {
                    reject(err);
                })
            })
        }

        this.removeGroupAdmin = (memberId, remover, groupId) => {
            return new Promise((resolve, reject) => {
                this.isGroupAdmin(remover, groupId)
                    .then(result => {
                        if(result.success){
                            this.isGroupAdmin(memberId, groupId)
                                .then(result =>{
                                    if(result.success){
                                        let admins = result.value.admins.filter(u => u.toString() != memberId);
                                        result.value.admins = admins;
                                        result.value.save()
                                            .then(sGroupChat =>{
                                                resolve({success: true, value: sGroupChat});
                                            }).catch(err =>{
                                                reject(err);
                                            })
                                    }else{
                                        resolve(result);
                                    }
                                }).catch(err => {
                                    reject(err);
                                })
                        }else{
                            resolve(result);
                        }
                    }).catch(err => {
                        reject(err);
                    })
            })
        }
     
        this.isMember = (userId, groupId) => {
            return new Promise((resolve, reject) => {
                UserChatModal.findById(groupId)
                    .then(groupChat => {
                        if(groupChat){
                            let usrIndex = groupChat.users.findIndex(a => a.toString() == userId);
                            if(usrIndex >= 0){
                                resolve({success: true, value: groupChat});
                            }else{
                                resolve({success: false, msg: "invalid member"});
                            }
                        }else{
                            resolve({success: false, msg: "invalid chat"});
                        }
                    }).catch(err => {
                        reject(err);
                    })
            })
        }


        this.isGroupAdmin = (adminId, groupId) => {
            return new Promise((resolve, reject) => {
                UserChatModal.findById(groupId)
                    .then(groupChat => {
                        if(groupChat){
                            let admIndex = groupChat.admins.findIndex(a => a.toString() == adminId);
                            if(admIndex >= 0){
                                resolve({success: true});
                            }else{
                                resolve({success: false, msg: "invalid admin"});
                            }
                        }else{
                            resolve({success: false, msg: "invalid chat"});
                        }
                    }).catch(err => {
                        reject(err);
                    })
            })
        }

        this.updateDescription = (groupId, description) => {
            return new Promise((resolve, reject) =>{
                UserChatModal.findById(groupId)
                    .then(groupChat => {
                        if(groupChat){
                            groupChat.description = description;
                            groupChat.save()
                                .then(sGroupChat => {
                                    resolve({success:true, value: sGroupChat});
                                }).catch(err => {
                                    reject(err);
                                })
                        }else{
                            resolve({success:false, msg: "invalid group"})
                        }
                    }).catch(err => {
                        reject(err);
                    })
            })
        }

      
         
    }



  


}
module.exports = MyChatManager;