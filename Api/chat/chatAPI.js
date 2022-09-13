const Router = require("express").Router();
const { response } = require("express");
const {MyChatManager, UsersManager, PushActionsManager} = require("../../CHAT");
const chatDataAdapter = require("../../CHAT/chatDataAdapter");
const MyChatDataAdapter = require("../../CHAT/chatDataAdapter")
Router.post("/send-message", (req, res) => {
    const {cid, message} = req.body;
 //// find chat 
 MyChatManager.pushMessage(cid, message)
    .then(({success, value}) => {
        if(success){
            res.json({chat: value, msg: "message saved"}).status(200);
        }else{
            MyChatManager.initializeChat([message.to, message.from])
                .then(({success, value}) => {
                    console.log(`success: ${success}, Valie: ${value}`);
                    return res.json({chat: value, msg: "chat initialized"}).status(200);
                }).catch(err => {
                    console.log(err)
                    return res.json({msg: "not found error: chat initializer"}).status(500);
                })
        }
    }).catch(err => {
        console.log(err);
        return res.json({msg: "not found error: push message"}).status(500);
    })
    // if not found > initialize chat
 //// push chat
})


Router.post("/initialize-chat", (req, res) => {
    const {userId, friendId} = req.body;

    MyChatManager.initializeChat([userId, friendId])
    .then(result => {
                let users = result.users;
                let friend = users.filter(u => u._id.toString() == friendId);
                if(friend.length>0){
                    friend = friend[0];
                }
                let chat = result.chat;
                return res.json({success: true, friend, chat}).status(200)
            }).catch(err => {
                console.log(err);
                return res.json({success: false, msg: "not found error"}).status(500);
            })
})


Router.post("/create-group", (req, res) => {
    const {groupChat} = req.body;
    MyChatManager.initializeGroupChat(groupChat.creator, groupChat.members, groupChat.title, groupChat.description)
        .then(cGroupChat => {   
            return res.json(cGroupChat).status(200)
        }).catch(err => {
            console.log(err);
            return res.json(err).status(500);
        })
})



Router.post("/user-chat-prepare", (req, res) => {
    const {userId, users} = req.body;
    MyChatManager.prepareChatObjects(userId, users)
        .then(chat => {
            return res.json({success: true, chat: chat}).status(200)
        }).catch(err => {
            console.log(err);
            return res.json({success: false, error:"not found error"}).status(500);
        })
})


Router.post("/user-chat", (req, res) => {
    const { userId} = req.body;
    UsersManager.getUserAllChats(userId)  
        .then(user => {
            if(user){
            
                 let userChat = MyChatDataAdapter(userId).transformUserChat(user.userChat);

                 let muser = {
                     _id: user._id,
                     username: user.username,
                     phoneNumber: user.phoneNumber,
                     userChat: userChat
                 }
                return res.json({success: true, user: muser}).status(200)
            }else{
                return res.json({success: false, msg: "user not found"}).status(404);
            }
        }).catch(err => {
            console.log(err);
            return res.json({success: false, msg: "not found error"}).status(500);
        })
})

Router.get("/single-chat", (req, res) => {
    const {u1, u2} = req.query;
    console.log(`U1:${u1}, U2:${u2}`)
    MyChatManager.chatExists([u1, u2])
        .then(userChatRes => {
            if(userChatRes.success){
                let userChat = chatDataAdapter(u1).transformSingleUserChat(userChatRes.value);
                res.json({success:true, value: userChat}).status(200);
            }else{
                res.json(userChatRes).status(200);
                
            }
        }).catch(err => {
            res.json(err).status(500);
        })
})

Router.get("/all", (req, res) => {
    MyChatManager.getAllChat().then(chat => res.json(chat).status(200)).catch(err => res.json(err).status(500))
})

Router.post("/make-admin", (req, res) => {
    const {groupId, maker, memberId} = req.body;
    MyChatManager.makeGroupAdmin(memberId, maker, groupId)
        .then(result =>{
            return res.json(result).status(200);
        }).catch(err => {
            console.log(err);
            return res.json({success:false, error: err}).status(500);
        })
})


// Router.post("/push-action", (req, res) => {
//     const { userId, type, payload } = req.body;
//     let PushManager = PushActionsManager(userId);
//     PushManager.pushAction(type, payload)
//         .then(sAction => {
//             res.json(sAction);
//         }).catch(err => {
//             console.log("NOT FOUND ERROR")
//             console.log(err);
//         })

// })

Router.post("/get-pushes", (req, res) => {
    const {userId} = req.body;
    console.log("TEST 03, UserId")
    console.log(userId);
    let PushManager = PushActionsManager(userId);
    PushManager.getPushes()
        .then(pushes => {
            res.json(pushes).status(200);
        }).catch(err => {
            console.log("Get Pushes: NOT FOUND ERROR")
            console.log(err);
            return res.json({msg: "not found error"})
        })
})


Router.post("/delete-push", async (req, res) => {
    const {userId, pushes} = req.body;
    let PushManager = PushActionsManager(userId);
    for (let index = 0; index < pushes.length; index++) {
        const singlePush = pushes[index];
         PushManager.removePushAction(singlePush._id).then(res => false).catch(err => false)
          
    }
    return res.json({msg: "pushes deleted"})
})


Router.post("/get-chat-server", (req, res) =>{
    let chatServer = {
        "iceServers": [
            {
                "url": "stun:global.stun.twilio.com:3478?transport=udp",
                "urls": "stun:global.stun.twilio.com:3478?transport=udp"
            },
            {
                "url": "turn:global.turn.twilio.com:3478?transport=udp",
                "username": "074df0ab75ff5358bf958f192f3cc6dab5e4bc9ffef0097dc6ecf8d51a9017eb",
                "urls": "turn:global.turn.twilio.com:3478?transport=udp",
                "credential": "iLUQcR+wuN2Iz/IKQjAkHp+r78OIjYGLbbPiUEo6gcs="
            },
            {
                "url": "turn:global.turn.twilio.com:3478?transport=tcp",
                "username": "074df0ab75ff5358bf958f192f3cc6dab5e4bc9ffef0097dc6ecf8d51a9017eb",
                "urls": "turn:global.turn.twilio.com:3478?transport=tcp",
                "credential": "iLUQcR+wuN2Iz/IKQjAkHp+r78OIjYGLbbPiUEo6gcs="
            },
            {
                "url": "turn:global.turn.twilio.com:443?transport=tcp",
                "username": "074df0ab75ff5358bf958f192f3cc6dab5e4bc9ffef0097dc6ecf8d51a9017eb",
                "urls": "turn:global.turn.twilio.com:443?transport=tcp",
                "credential": "iLUQcR+wuN2Iz/IKQjAkHp+r78OIjYGLbbPiUEo6gcs="
            }
        ]
    }
    res.json({server: chatServer}).status(200);
})
module.exports = Router;