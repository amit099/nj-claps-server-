const MyAgoraManager = require("../../Controllers/broadcast/agoraManager");
const MyRoomsController = require("../../Controllers/broadcast/roomsController");
const MyTribesController = require("../../Controllers/broadcast/tribesController");
const {uploadS3} = require("../../Config/fileUpload")
const Router = require("express").Router();


Router.get("/", (req, res) => {
   let userId = req.query.userId;
   if(userId){
        MyRoomsController.getRoomsCreatedByUser(userId)
        .then(rooms => {
            res.json(rooms).status(200);
        }).catch(err => {
            res.json(err).status(500);
        })
   }else{
       MyRoomsController.getAll()
           .then(rooms => {
               res.json(rooms).status(200);
           }).catch(err => {
               res.json(err).status(500);
           })
   }
})



Router.post("/", (req, res) => {
    const {title, userId, interestId, description, tribe} = req.body;
    MyRoomsController.createNew(title, userId, interestId, description, tribe)
        .then(createdRoom => {
            res.json(createdRoom).status(200);
        }).catch(err => {
            res.json(err).status(500);
        })
})




Router.delete("/:_id", (req, res) => {
    const roomId = req.params._id;
    MyRoomsController.delete(roomId)
        .then(deletedRoom => {
            res.json({...deletedRoom, success:true }).status(500);
        }).catch(err => {
            res.json(err).status(500);
        })
} )


Router.post("/generate-broadcaster-credencials", (req, res) => {
     MyAgoraManager.generateBroadcastHostingCredencials() 
        .then(uidRes => {
            res.json(uidRes).status(200)
        }).catch(err =>{
            res.json(err).status(500);
        })
})

Router.post("/generate-audiance-credencials", (req, res) => {
    const {channelName} = req.body;
     MyAgoraManager.generateAudianceCredencials(channelName) 
        .then(uidRes => {
            res.json(uidRes).status(200)
        }).catch(err =>{
            res.json(err).status(500);
        })
})

Router.get("/active", (req, res) => {
    const userId = req.query.userId;
    console.log(`UserId: ${userId}`)
    MyRoomsController.getActiveRoomByUserId(userId)
        .then(activeRoom => {
            if(activeRoom && activeRoom.isActive){
                res.json({activeRoom: activeRoom}).status(200);
            }else{
                res.json({activeRoom: null}).status(200);
            }
            
        }).catch(err => {
            res.json(err).status(500);
        })
})

Router.get("/active/all", (req, res) => {
    const userId = req.query.userId;
    if(userId){
        MyRoomsController.getRoomsByUserInterests(userId)
        .then(rooms => {
            MyRoomsController.getActiveRoomsByTribes(userId)
                .then(trooms => {
                    res.json({rooms: [...trooms,...rooms]}).status(200);
                }).catch(err => {
                    res.json({rooms: rooms}).status(200);
                })
        }).catch(err => {
            res.json(err).status(500);
        })
    }else{
        MyRoomsController.getAllActiveRooms()
        .then(rooms => {
                res.json({rooms: rooms}).status(200);
        }).catch(err => {
            res.json(err).status(500);
        })
    }
  
})

Router.get("/tribe", (req, res) => {
    if(req.query.modrator){
        MyTribesController.getByModrator(req.query.modrator)
        .then(tribes =>{
            res.json({success:true, tribes}).status(200);
        }).catch(err =>{
            res.json({success:false, error: {message: err}}).status(500);
        })
    }else if(req.query.member){
        MyTribesController.getByMemberId(req.query.member)
        .then(tribes =>{
            res.json({success:true, tribes}).status(200);
        }).catch(err =>{
            res.json({success:false, error: {message: err}}).status(500);
        })
    }else{
        res.json({success:false, error: {message: "invalid parameters"}}).status(500);
    }
})
Router.get("/tribe/:_id", (req, res) => {
    if(req.params._id){
        MyTribesController.getByIdPopulated(req.params._id)
        .then(tribe =>{
            res.json({success:true, tribe}).status(200);
        }).catch(err =>{
            res.json({success:false, error: {message: err}}).status(500);
        })
    }else{
        res.json({success:false, error: {message: "invalid parameters"}}).status(500);
    }
})




Router.post("/tribe", uploadS3.single("image") ,(req, res) => {
    const {name, description, modrator, thumbnail } = req.body;
    if(req.file){
        MyTribesController.create(modrator, name, description, req.file.location , req.file.key , thumbnail)
            .then(tribe => {
                res.json({success: true, tribe}).status(200);
            }).catch(err => {
                res.json({success:false, error: {message: err}}).status(500);
            })
    }else{
        res.json({success:false, error: {message: `Invalid Image`}}).status(500);
    }
})
Router.patch("/tribe/:_id", (req, res) => {
    const tribeObject = req.body;
    delete tribeObject.rooms;
    delete tribeObject.members;
    delete tribeObject.picture;
    MyTribesController.update(req.params._id, tribeObject)
        .then(tribe => {
            res.json({success: true, tribe}).status(200);
        }).catch(err => {
            res.json({success:false, error: {message: err}}).status(500);
        })
})
Router.patch("/tribe-image/:_id", uploadS3.single("image") , (req, res) => {
    if(req.file){
        MyTribesController.updateImage(req.params._id, req.file.location, req.file.key)
        .then(tribe => {
            res.json({success: true, tribe}).status(200);
        }).catch(err => {
            res.json({success:false, error: {message: err}}).status(500);
        })
    }else{
        res.json({success:false, error: {message: `invalid image`}}).status(500);
    }   
   
})
Router.delete("/tribe/:_id", (req, res) => {
    MyTribesController.delete(req.params._id)
        .then(tribe => {
            if(tribe){
                res.json({success: true, tribe}).status(200);
            }else{
                res.json({success: false, error: {message: "invalid tribe"}}).status(200);
            }
        }).catch(err => {
            res.json({success:false, error: {message: err}}).status(500);
        })
})

Router.get("/tribe/members/:_id", (req, res) => {
    MyTribesController.getTribeMembers(req.params._id)
        .then(tribeMembers => {
            res.json({success: true, tribeMembers}).status(200);
        }).catch(err => {
            res.json({success:false, error: {message: err}}).status(500);
        })
})

Router.post("/tribe/member/push", (req, res) => {
    const {tribeId, memberId} = req.body;
    MyTribesController.pushMember(tribeId, memberId)
        .then(tribe => {
            res.json({success: true, tribe}).status(200);
        }).catch(err => {
            res.json({success:false, error: {message: err}}).status(500);
        })
})

Router.post("/tribe/leave", (req, res) => {
    const {tribeId, memberId} = req.body;
    MyTribesController.removeMember(tribeId, memberId)
        .then(tribe => {
            res.json({success: true, tribe}).status(200);
        }).catch(err => {
            res.json({success:false, error: {message: err}}).status(500);
        })
})

Router.post("/tribeinv", (req, res) => {
    const {user, sender, tribe} = req.body;
    MyTribesController.createInvitation(user, sender, tribe)
        .then(invite => {
            res.json({success: true, invite}).status(200);
        }).catch(err => {
            res.json({success:false, error: {message: err}}).status(500);
        })
})

Router.get("/tribeinv", (req, res) => {
    const user = req.query.user;
    const tribe = req.query.tribe;
    const sender = req.query.sender;
    const status = req.query.status;
    MyTribesController.getInvitations(user, sender, tribe, status)
    .then(invites => {
        res.json({success: true, invites}).status(200);
    }).catch(err => {
        res.json({success:false, error: {message: err}}).status(500);
    })

})

Router.patch("/tribeinv/:_id", (req,res) => {
    const status = req.body.status;
    MyTribesController.updateInviteStatus(req.params._id, status)
    .then(invite => {
        res.json({success: true, invite}).status(200);
    }).catch(err => {
        res.json({success:false, error: {message: err}}).status(500);
    })

})


module.exports = Router;