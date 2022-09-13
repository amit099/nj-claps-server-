const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const socketio = require("socket.io");
const cors = require('cors');
const CallStatus = require("./CHAT/callStatus");
const CallPacket = require("./CHAT/callPacket");
const MyPush = require("./CHAT/myPush");
const { MyChatManager, PushActionsManager } = require("./CHAT");
const NotificationsManager = require("./CHAT/notificationsManager");
const users = require('./Routs/myroute');

app.use(express.json({ parameterLimit: 100000, limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
///////////////////DATABASE  CONFIGURATION  ///////////////////
const db = require("./Config/db").mongodbOnline;
let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}



const { getImage } = require("./Config/fileUpload");
const MyRTManager = require("./Controllers/broadcast/rtmanager");

app.use(passport.initialize());

mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(m => {
        // global.mongodbconndbs = m.connection;
        console.log("db connected")

        require("./Config/passport")(passport);
        ///////////////// API ROUTES ////////////////
        app.use("/auth", cors(corsOptions), require("./Routs/auth"));
        app.use("/settings", cors(corsOptions), require("./Routs/settings"));
        app.use("/predefines", cors(corsOptions), require("./Routs/predefines"));
        app.use("/rt", cors(corsOptions), require("./Routs/broadcast"))
        app.use("/follow", cors(corsOptions), require("./Api/follow"))
        app.use("/test", cors(corsOptions), require('./Api/test'))
        app.use("/streams", cors(corsOptions), require('./Routs/streams'))
        app.use("/stories", cors(corsOptions), require("./Api/stories"))
        app.get("/", (req, res) => {
            return res.json({ message: "Claps app Server Running..." }).status(200);
        });

    })
    .catch(err => {
        console.log(err);
        console.log("Catch Error, db Connectivity ");
    })

///////////// PORT ENVOIRMENT //////////////////
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
    console.log(`SERVER RUNNING AT PORT ${port}`);
});



const io = socketio(server, {
    cors: {
        origin: '*',
    }
});


io.on("connection", (socket) => {
    const cid = socket.handshake.query.cid;
    const ActionPusher = PushActionsManager(cid);
    const MyNotificationsManager = new NotificationsManager();
    console.log(`${cid} :connected`);
    socket.join(cid);

    socket.on("onMessageSent", (res, ack) => {
        let query = res.query;
        //// send message to user

        query.message.status = 1; //// MEAN SENT

        const PartnerActionPusher = PushActionsManager(query.message.to);

        PartnerActionPusher.pushAction(MyPush.TEXT_MESSAGE, query.message)
            .then((sAction) => {
                ack({
                    success: true,
                    message: {
                        _id: query.message._id,
                        newId: sAction._id,
                        to: query.message.to,
                    },
                });
                query.message._id = sAction._id;
                socket.in(query.message.to).emit("onRecieveMessage", { query: query });
            })
            .catch((err) => {
                console.log("CATCH: ERROR ON SENT SAVING");
                console.log(err);
            });

        //// ------- To Save message On Server Permanently its not part of Push Module-----///
        // MyChatManager.pushMessage(query.chatId, query.message)
        //     .then(res =>{
        //         let msg = res.value.messages[res.value.messages.length-1];
        //         console.log("SENT MESSAGE: SAVED")
        //         console.log(msg);

        // }).catch(err =>{
        //     console.log("CATCH: ERROR ON SENT SAVING")
        //     console.log(err);
        // })
        //// -----------------------------------------------------------------------------//////
    });

    socket.on("onRecievedAckSend", (res, ack) => {
        // ack({success: true})
        socket
            .in(res.query.message.from)
            .emit("onRecievedAck", { query: res.query });
    });

    socket.on("onMarkSeenSent", (res, ack) => {
        ack({ success: true });
        console.log(res.query.messages);

        // const ActionPusher = res.query.messages.length > 0 ? PushActionsManager(res.query.messages[0].to): null;

        // res.query.messages.forEach(message => {
        //     ActionPusher.removePushAction(message._id).then(res => false).catch(err => console.log(err))
        // MyChatManager.updateMessage(res.query.chatId, message)
        //     .then(res=> {

        //     }).catch(err => {
        //         console.log(err);
        //     })
        // });
        socket.in(res.query.to).emit("onMarkSeen", { query: res.query });
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////   CALLING LISTNERS : RTC singnaling    /////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    //// CALLER:
    socket.on("sendOffer", (res) => {
        console.log("STEP-1 SENDING Offer - SERVER");
        let to = res.query.to;
        let from = res.query.from;
        let offer = res.query.offer;
        socket.in(to).emit("offer", { query: { to: to, from: cid, offer: offer } });
        // console.log(res);
    });

    //// CALLER:
    socket.on("onSendRTCMessage", (res) => {
        ///
        let to = res.query.to;
        // console.log("onSendMessage");
        // console.log(res);
        socket.in(to).emit("onRecieveRTCMessage", { query: res.query });
    });

    socket.on("sendAnswer", (res) => {
        // console.log("STEP-3 SENDING Answer");
        // console.log(res)
        let answer = res.query.answer;
        let to = res.query.to;
        socket.in(to).emit("answer", { query: { from: cid, answer: answer } });

        //// send to "answer"
        // socket.join(res.query.roomID)
        // console.log(`Request accepted by ${userID} RoomID: ${res.query.roomID}`)
    });

    //// SEND ICE
    socket.on("responseIce", (res) => {
        console.log("STEP-4 SENDING Response ICE");
        console.log(res);
        //// send ice to "ice"
        let candidate = res.query.candidate;
        let to = res.query.to;
        socket.in(to).emit("ice", { query: { from: to, candidate: candidate } });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////// CALL SINGNALING ///////////////////////////////////////////////////////////

    socket.on("onCommunicate", (req, ack) => {
        let packet = req.query;
        console.log(">OnCommunicate:Packet")
        console.log(packet)
        console.log("======= ROOM:TO========")

        switch (packet.type) {
            case CallStatus.RINGING_REQUEST:
                if (socket.adapter.rooms.has(packet.to)) {
                    //// online
                    console.log("Sending VOIP Push...")
                    MyNotificationsManager.sendVoipNotification(packet.to, { type: "INCOMMING_CALL", payload: packet })
                    socket.in(packet.to).emit("onListen", { query: packet });

                    ack(new CallPacket(CallStatus.USERONLINE, packet.to, packet.from));
                } else {
                    /// offline
                    console.log(`PEER OFFLINE :${packet.to} Attempt: ${packet.attempt}`)
                    if (packet.attempt === 0) {
                        ///TODO: Send Notification here for first time only.
                        console.log("Sending VOIP Push...")
                            // MyNotificationsManager.sendVoipNotification(packet.to)
                        MyNotificationsManager.sendVoipNotification(packet.to, { type: "INCOMMING_CALL", payload: packet })

                    }
                    ack(new CallPacket(CallStatus.USEROFFLINE, packet.to, packet.from));
                }
                break;
            case CallStatus.ACCEPTED:
                if (socket.adapter.rooms.has(packet.to)) {
                    socket.in(packet.to).emit("onListen", { query: packet });
                    ack(new CallPacket(CallStatus.USERONLINE, packet.to, packet.from));
                } else {
                    ///// TEST IF NEED to Change it to USEROFFLINE
                    ack(new CallPacket(CallStatus.USERONLINE, packet.to, packet.from));
                }
                break;
            case CallStatus.REJECTED:
                MyNotificationsManager.sendVoipNotification(packet.to, { type: "REJECT_CALL", payload: packet })
                socket.in(packet.to).emit("onListen", { query: packet });
                break;
            default:
                socket.in(packet.to).emit("onListen", { query: packet });
                break;
        }
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////// PUSH MANAGER /////////////////////////////////////////////////////////

    socket.on("onPushActionCommunicator", (req, ack) => {
        let action = req.query;
        // action.payload.status = 1; //// MEAN SENT


        switch (action.pushType) {
            case MyPush.MESSAGE_INITIAL:
                let message = action.payload.message;
                const PartnerActionPusher_ = PushActionsManager(message.to);
                console.log("ACTION SENDING....")
                console.log(action)
                PartnerActionPusher_.pushAction(action.pushType, action.payload)
                    .then((sAction) => {
                        MyChatManager.initializeChat([message.to, message.from]).then(d => console.log(`CHAT INITIALIZED ON SERVER`)).catch(err => console.log(err));
                        // ack({pushType: MyPush.ACK_MESSAGE, _id: sAction._id, localId: action.localId,  payload: {_id: action.payload._id, newId: sAction._id ,to: query.message.to}})

                        // action.payload._id = sAction._id;

                        action._id = sAction._id;
                        ack(action);
                        socket
                            .in(action.to)
                            .emit("onListenPushCommunicator", { query: action });
                    })
                    .catch((err) => {
                        console.log("CATCH: ERROR ON SENT SAVING");
                        console.log(err);
                    });
                break;
            default:
                let msg = action.payload;
                const PartnerActionPusher = PushActionsManager(msg.to);
                console.log("ACTION SENDING....")
                console.log(action)
                if (action.pushType === MyPush.MESSAGE) {
                    MyNotificationsManager.sendVoipNotification(action.to, { type: "MESSAGE NOTIFICATION", payload: "you recieved a message" }).then(sent => console.log("Mesage Notify Sent")).catch(err => console.log("Error in sending notification message"));
                }

                PartnerActionPusher.pushAction(action.pushType, msg)
                    .then((sAction) => {
                        // ack({pushType: MyPush.ACK_MESSAGE, _id: sAction._id, localId: action.localId,  payload: {_id: action.payload._id, newId: sAction._id ,to: query.message.to}})

                        // action.payload._id = sAction._id;

                        action._id = sAction._id;
                        ack(action);
                        socket
                            .in(action.to)
                            .emit("onListenPushCommunicator", { query: action });
                    })
                    .catch((err) => {
                        console.log("CATCH: ERROR ON SENT SAVING");
                        console.log(err);
                    });
                break;
        }



    });

    socket.on("onPushGroupActionCommunicator", (req, ack) => {
        let action = req.query;
        console.log(`C-1: On Push Group Action`);
        console.log(action);
        let users = action.users.filter((u) => u._id != cid);
        let usersIds = users.map(u => u._id)
        if (usersIds.length > 0) {

            const PartnerActionPusher = PushActionsManager("");
            PartnerActionPusher.pushGroupActions(action.pushType, action.payload, usersIds)
                .then((res) => {
                    console.log("PUSHED GROUPLY");
                    console.log(res);
                    console.log(`C-1: Pushing for uesrs `);
                    console.log(users);
                    for (let index = 0; index < users.length; index++) {
                        const userId = users[index]._id;
                        console.log(`Pushing for user userId:${userId}`);
                        action._id = res;
                        socket
                            .in(userId)
                            .emit("onListenGroupPushCommunicator", { query: action });
                    }
                    ack(action);
                })
                .catch((err) => {
                    console.log("CATCH: ERROR");
                    console.log(err);
                });
        } else {
            console.log(`Not user to push action`)
            console.log(action);
            ack(action);
        }

    });

    socket.on("onPushCommunicator", (req, ack) => {
        let action = req.query;
        switch (action.pushType) {
            case MyPush.SETVER_ACTION_REMOVE_PUSHES:
                let markedPushesToDel = action.payload;
                ActionPusher.removePushActions(markedPushesToDel).then((res) => {
                    ack(res);
                });
                break;
            case MyPush.SETVER_ACTION_REMOVE_PUSH:
                console.log("PUSH ACK: DELETE REQUEST");
                console.log(action);
                ActionPusher.removePushAction(action.payload._id)
                    .then((res) => {
                        ack(res);
                    })
                    .catch((err) => console.log(err));
                break;

            default:
                break;
        }
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    socket.on("disconnect", () => {
        // socket.emit("onUsers", {query: {users: users}});
        console.log(`${cid}: Disconnected from chat`)
        socket.leave(cid);
    });
});





const broadcastIO = socketio(server, {
    cors: {
        origin: '*',
    },
    path: "/another"
});
global.broadcastIO = broadcastIO;

broadcastIO.on("connection", (socket) => {
    let uid = socket.handshake.query.uid;
    MyRTManager.join(uid, socket);
    socket.once("disconnect", () => {
        MyRTManager.leave(uid);
    })
})