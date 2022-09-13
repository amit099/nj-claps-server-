const FollowManager = require("../../Controllers/User/follow");
const Router = require("express").Router();
const MyFollowManager = new FollowManager();

Router.post("/create", (req, res) => {
    const {userId, followerId} = req.body;
    console.log(`${userId} Creating Follower, ${followerId}`)
    MyFollowManager.followUser(userId, followerId)
        .then(singleFollow => {
            res.json({success: true, singleFollow}).status(200);
        }).catch(err => {
            res.json(err).status(500)
        })
})

Router.post("/remove", (req, res) => {
    const {userId, followerId} = req.body;
    console.log(`${userId} Removing Follower, ${followerId}`)
    MyFollowManager.unfollowUser(userId, followerId)
        .then(singleFollow => {
            res.json({success: true, singleFollow}).status(200);
        }).catch(err => {
            res.json(err).status(500)
        })
})


Router.get("/followers", (req, res) => {
    const userId = req.query.userId;
    MyFollowManager.getFollowers(userId)
    .then(followers =>{
        res.json({success:true, followers}).status(200);
    }).catch(err =>{
        res.json(err).status(500);
    })
})

Router.get("/followings", (req, res) => {
    const userId = req.query.userId;
    MyFollowManager.getFollowings(userId)
    .then(followings =>{
        res.json({success:true, followings}).status(200);
    }).catch(err =>{
        res.json(err).status(500);
    })
})


module.exports = Router;