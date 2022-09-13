const Router = require("express").Router();
const StoriesController = require("../../Controllers/stories")

Router.post("/filter-by-users", (req, res) => {
    const users = req.body.users;
    const storiesController = new StoriesController();
    storiesController.getByUsers(users)
    .then(stories => {
        res.json({success: true, storyUsers: stories}).status(200);
    }).catch(err => {
        res.json({success: false, error: {message: err}}).status(500);
    })
})

Router.post("/create", (req, res) => {
    const story = req.body;
    const storiesController = new StoriesController();
    storiesController.create(story.userId, story.createdAt, story.media, story.description)
        .then(createdStory => {
            res.json({success: true, story: createdStory}).status(200);
        }).catch(err => {
            res.json({success: false, error: {message: err}}).status(500);
        })
})

Router.post("/mark-seen", (req, res) => {
    const {userId, storyId, seenTime} = req.body;
    const storiesController = new StoriesController();
    storiesController.markSeen(storyId, userId, seenTime)
        .then(story => {
            res.json({success: true, story}).status(200);
        }).catch(err => {
            res.json({success: false, error: {message: err}}).status(500);
        })
})

Router.delete("/:_id", (req, res) => {
    const storiesController = new StoriesController();
    storiesController.deleteStory(req.params._id)
        .then(deletedStory => {
            res.json({success: true, story: deletedStory}).status(200);
        }).catch(err => {
            res.json({success: false, error: {message: err}}).status(500);
        })
})





module.exports = Router;