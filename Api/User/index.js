const Router = require("express").Router();
const { uploadS3 } = require("../../Config/fileUpload");
const MyUserControler = require("../../Controllers/User");
const passportJwtValidator = require("../../Config/passportJwtValidator");
const { UsersManager } = require("../../CHAT");
const MyErrorHandler = require("../../Controllers/broadcast/errorHandler");

Router.patch("/updatecustom",
    (req, res) => {
        const {data} = req.body;
        // return res.json({message: "true"}).status(200);

        MyUserControler.customUpdate(data)
        .then(result => {
            return res.json(result).status(200);
        })
        .catch(err => {
            return res.json(err).status(500).status(500);
    } )
})


Router.post("/socialsignup",
    uploadS3.single("image"),
    (req, res) => {
        const data = JSON.parse(req.body.data);
        MyUserControler.preSocialSignUpAdd(data, req)
        .then(result => {
            return res.json(result).status(200);
        })
        .catch(err => {
            return res.json(err).status(500).status(500);
    } )
})

Router.post("/signup",
    uploadS3.single( "image" ),
    (req, res) => {
        console.log("api called");

        const data = JSON.parse(req.body.data);
        MyUserControler.preAdd(data, req)
        .then(result => {
            return res.json(result).status(200);
        })
        .catch(err => {
            return res.json(err).status(500).status(500);
    })
})


Router.post("/login", (req, res) => {
    const { data } = req.body;
    MyUserControler.login( data )
    .then(result => {
        return res.json(result).status(500);
    })
    .catch(err => {
        return res.json(err).status(500).status(500);
    } )
})


Router.post("/sociallogin", (req, res) => {
    const { social } = req.body;
    MyUserControler.sociallogin( social )
    .then(result => {
        return res.json(result).status(500);
    })
    .catch(err => {
        return res.json(err).status(500).status(500);
    })
})

Router.post("/sociallogin/v2", (req, res) => {
    const { social } = req.body;
    MyUserControler.sociallogin( social )
    .then(result => {
        return res.json(result).status(500);
    })
    .catch(err => {
        return res.json(err).status(500).status(500);
    } )
})



Router.get("/",
    (req, res) => {
        MyUserControler.getList()
        .then(result => {
            return res.json(result).status(200);
        })
        .catch(err => {
            return res.json(err).status(500).status(500);
    } )
    })

    Router.delete("/:_id?",
        (req, res) => {
            let data = {};
            data._id = req.params._id;
        MyUserControler.delete(data)
        .then(result => {
            return res.json(result).status(200);
        })
        .catch(err => {
            return res.json(err).status(500).status(500);
    } )
    })


Router.patch("/password",
    (req, res) => {
            const { data } = req.body;
        MyUserControler.updatePassword(data)
        .then(result => {
            return res.json(result).status(200);
        })
        .catch(err => {
            return res.json(err).status(500).status(500);
    } )
    })

    
Router.patch("/profile",
        passportJwtValidator,
        uploadS3.single( "image" ),
    (req, res) => {
            
        // return res.json({ message: "true" });
        const data = JSON.parse(req.body.data);
        // console.log("data----------");
        // console.log(data);
        data._id = req.user.user.user._id;
            MyUserControler.preUpdateProfile(data, req)
            .then(result => {
                return res.json(result).status(200);
            })
            .catch(err => {
                return res.json(err).status(500).status(500);
        } )
})





Router.post("/update-notify-token", (req, res) => {
    const { userId, notifyToken, platorm } = req.body;
    console.log(`> Updating Notify Token: ${userId}, ${notifyToken}, ${platorm}`)
    UsersManager.updateNotifyToken(userId, notifyToken, platorm)
      .then((updatedUser) => {
        console.log("Notify Token Updated");
          return res.json({ success: true, updatedUser }).status(200);
      })
      .catch((err) => {
        console.log("CATCH");
        return res.json({ msg: err, success: false }).status(500);
      });
  });





Router.post("/get-all", (req, res) => {
    UsersManager.getAllUsers()
      .then((users) => {
        res.json({ success: true, users }).status(200);
      })
      .catch((err) => {
        res.json({ success: false, error: err }).status(500);
      });
  });
  
  Router.post("/get-chats", (req, res) => {
    UsersManager.getUserAllChats(req.body.userId)
      .then((chat) => {
        return res.json(chat).status(200);
      })
      .catch((err) => {
        return res.json(err).status(500);
      });
  });
  
//   Router.post("/update-user", (req, res) => {
//     UsersManager.updateUser(req.body.user)
//       .then(updated => {
//         res.json(updated).status(200);
//       }).catch(err => {
//         res.json(err).status(500);
//       })
//   })
  
  Router.get("/get-user-publi-info/:_id", (req, res ) => {
    let userId = req.params._id;
    UsersManager.getUserPublicInfo(userId)  
      .then(response => res.json(response).status(200)).catch(err => res.json(err).status(500));
  })
  
  
  Router.post("/update-profile-image", (req, res) => {
    console.log(req.body);
      const userId = req.body.userId;
      const imageUrl = "";
      const thumbnail = req.body.thumbnail;
      UsersManager.updateUserProfileImage(userId, imageUrl, thumbnail)
        .then(response => {
          return res.json(response).status(200);
        }).catch(err => {
          console.log("CATCH error in authAPI/update-profile-image");
          console.log(err);
          return res.json(err).status(500);
        })
  })
  

  Router.get("/interests/:_id", (req, res) => {
    const userId = req.params._id;
    UsersManager.getUserInterest(userId)
        .then(interests => {
            res.json({success:true, interests}).status(200);
        }).catch(err => {
            res.json(err).status(500);
        })
  })


  Router.get("/get-basic-info/:_id", (req, res) =>{
      const userId = req.params._id;
      UsersManager.getUserById(userId)
        .then(foundUser => {
            let user = foundUser.toJSON();
            res.json({success: true, user: {_id: user._id, followerCount: user.followerCount, followingCount: user.followingCount}}).status(200);
        }).catch(err => {
            res.json(err).status(500);
        })
  })


  Router.post("/get-basic-info", (req, res) => {
      const {requestingUserId, userId} = req.body;
      console.log(`${requestingUserId}:${userId}`)
      UsersManager.getUserById(requestingUserId)
      .then(foundUser => {
          if(foundUser){
            let user = foundUser.toJSON();
            // console.log(user);
            let followIndex = foundUser.follows.findIndex(f => f.user.toString() === userId);
            let follower = false;
            let following = false;
             
            if(followIndex >= 0){
                follower = foundUser.follows[followIndex].follower
                following = foundUser.follows[followIndex].following
            }

            UsersManager.getUserById(userId)
                .then(secondUser => {
                    let sUser = secondUser.toJSON();
                    res.json({success: true, user: {_id: user._id, followerCount: sUser.followerCount, followingCount: sUser.followingCount, tribeCount: sUser.tribeCount ,follower, following, socialLinks: sUser.socialLinks}}).status(200);
                }).catch(err => {
                    res.json(err).status(500);
                })
           
          }else{
          res.json(MyErrorHandler.build("Invalid User")).status(500);

          }
          
      }).catch(err => {
          res.json(err).status(500);
      })
  })



module.exports = Router;