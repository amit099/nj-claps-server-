const MyAgoraManager = require("../../Controllers/broadcast/agoraManager");
const MyBroadcastMemberController = require("../../Controllers/broadcast/broadcastMemberController");
const MyRoomsController = require("../../Controllers/broadcast/roomsController");
const MyTribesController = require("../../Controllers/broadcast/tribesController");
const MyUserControler = require("../../Controllers/User");
const FollowManager = require('../../Controllers/User/follow');
const { TribesInvitationsModal } = require("../../Modals");
const MyFollowManager = new FollowManager();
const Router = require("express").Router();

Router.get("/", (req, res) => {

    // TribesInvitationsModal.find({status: 0})
    //     .then(invites => {
    //         res.json({success:true, invites}).status(200);
    //     }).catch(Err => {
    //         console.log(Err)
    //         res.json(Err).status(500);
    //     })
  MyTribesController.getUserJoinedTribeIds("61010241d0fc8c001515415f")
    .then(tribes =>{
        res.json({success:true, tribes}).status(200);
    }).catch(err =>{
        res.json(err).status(500);
    })

})


Router.post("/", (req, res) => {
    const {name, description, modrator } = req.body;
    MyTribesController.create(modrator, name, description, "", "")
        .then(tribe => {
            res.json({success: true, tribe}).status(200);
        }).catch(err => {
            res.json(err).status(500)
        })
})

Router.patch("/:_id", (req, res) => {
    const roomId = req.params._id;
    const room = req.body.room;
    MyRoomsController.updateRoom(roomId, room)
        .then(updatedRoom => {
            res.json(updatedRoom).status(200);
        }).catch(err => {
            console.log(`CATCH Error in updating room`);
            console.log(err);
            res.json(err);
        })
})


Router.delete("/:_id", (req, res) => {



    // MyBroadcastMemberController.delete(memberId)
    //     .then(members => {
    //         res.json(members).status(200);
    //     }).catch(err =>{
    //         res.json(err).status(500);
    //     })
    const roomId = req.params._id;
    MyRoomsController.delete(roomId)
        .then(deleted => {
            res.json(deleted).status(200);
        }).catch(err =>{
            res.json(err).status(500);
        })
})
module.exports = Router;