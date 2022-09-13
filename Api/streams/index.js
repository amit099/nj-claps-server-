const Router = require("express").Router();
const StreamsOperationManager  = require("../../Controllers/streams/streamsOperationsManager")
Router.post("/", (req, res) => {
    const {userId, streamUrl, poster, description} = req.body;
    const streamsManager = new StreamsOperationManager();
    streamsManager.create(userId, streamUrl, poster, description)
        .then(createdStream => {
            res.json({stream:createdStream, success: true}).status(200)
        }).catch(err => {
            res.json({success:false, error: {message: `Internal server error`}}).status(500);
        })
})

Router.get("/", (req, res) => {
    const streamsManager = new StreamsOperationManager();
    streamsManager.get(req.query.userId)
        .then(streams => {
            res.json({streams: streams, success:true}).status(200)
        }).catch(err => {
            res.json({success:false, error: {message: `Internal server error`}}).status(500);

        })
})
Router.get("/single/:_id", (req, res) => {
    const streamsManager = new StreamsOperationManager();
    const streamId = req.params._id;
    streamsManager.getById(streamId)
        .then(singleStream => {
            res.json({stream: singleStream, success: true}).status(200)
        }).catch(err => {
            res.json({success:false, error: {message: `Internal server error`}}).status(500);
        })
    ///// 
})

Router.delete("/:_id", (req, res) => {
    const streamsManager = new StreamsOperationManager();
    const streamId = req.params._id;
    streamsManager.delete(streamId)
    .then(singleStream => {
        res.json({stream: singleStream, success:true}).status(200)
    }).catch(err => {
        res.json({success:false, error: {message: `Internal server error`}}).status(500);

    })
    ///// 
})

Router.post("/mark-seen", (req, res) => {
    const streamsManager = new StreamsOperationManager();
    const {userId, streamId} = req.body;
    streamsManager.createMarkSeen(userId, streamId)
        .then(singleStream => {
            res.json({stream: singleStream, success: true}).status(200)
        }).catch(err => {
                res.json({success:false, error: {message: `Internal server error`}}).status(500);

        })
    ///// 
})

Router.post("/like", (req, res) => {
    const streamsManager = new StreamsOperationManager();
    const {userId, streamId, liked} = req.body;
    streamsManager.createLike(userId, streamId, liked)
        .then(singleStream => {
            res.json({stream:singleStream, success:true}).status(200)
        }).catch(err => {
            res.json({success:false, error: {message: `Internal server error`}}).status(500);

        })
    ///// 
})






Router.get("/me", (req, res) => {
    const streamsManager = new StreamsOperationManager();
    const userId = req.query.userId;
    console.log(userId)
    streamsManager.getByUserId(userId)
        .then(streams => {
            res.json({streams: streams, success: true}).status(200)
        }).catch(err => {
            console.log(err)
                        res.json({success:false, error: {message: `Internal server error`}}).status(500);

        })
    ///// 
})


Router.post("/comments", (req, res) => {
    const streamsManager = new StreamsOperationManager();
    const comment = req.body;
    streamsManager.createStreamComment(comment.userId, comment.streamId, comment.commentText, comment.commentType, comment.payload ,comment.dateTime)
        .then(singleStream => {
            res.json({stream: singleStream, success: true}).status(200)
        }).catch(err => {
                        res.json({success:false, error: {message: `Internal server error`}}).status(500);

        })
    ///// 
})

Router.get("/comments", (req, res) => {
    const streamsManager = new StreamsOperationManager();
    const streamId = req.query.streamId;
    streamsManager.getStreamComments(streamId)
        .then(comments => {
            res.json({comments: comments, success: true}).status(200)
        }).catch(err => {
                        res.json({success:false, error: {message: `Internal server error`}}).status(500);

        })
    /// 
})


Router.post("/flush-stream-comments", (req, res) => {
    const {streamId} = req.body;
    const streamsManager = new StreamsOperationManager();
    streamsManager.updateStream(streamId, {comments: []})
        .then(stream => {
            res.json({stream, success: true}).status(200)
        }).catch(err => {
            res.json({success:false, error: {message: `Internal server error`}}).status(500);
        })
})



module.exports = Router;