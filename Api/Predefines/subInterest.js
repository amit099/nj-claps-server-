const Router = require("express").Router();
const { SubInterestModal } = require("../../Modals");
const MyPredefinesController = require("../../Controllers/predefines");
const InterestsController = require("../../Controllers/v2/interests")
Router.post("/", (req, res) => {
    const { data } = req.body;
    MyPredefinesController.add(data, SubInterestModal, "Sub Interest")
    .then(result => {
        return res.json(result).status(200);
    })
    .catch(err => {
        return res.json(err).status(500);
    } )
})

Router.post("/v2", (req, res) => {
    const { data } = req.body;
    let interestController = new InterestsController();
    interestController.handleCreateSubInterest(data.title, data.interestId)
        .then(created => {
            res.json({success: true, interest: created}).status(200)
        }).catch(err => {
            res.json({success: false, error: err}).status(500);
        })
    // MyPredefinesController.add(data, SubInterestModal, "Sub Interest")
    // .then(result => {
    //     return res.json(result).status(200);
    // })
    // .catch(err => {
    //     return res.json(err).status(500);
    // } )
})

Router.post("/v2/list", (req, res) => {
    const { data } = req.body;
    console.log(data);
    let interestController = new InterestsController();
    interestController.handleCreateMultipleSubInterest(data.interests, data.interestId)
        // .then(created => {
        //     res.json({success: true, interest: created}).status(200)
        // }).catch(err => {
        //     res.json({success: false, error: err}).status(500);
        // })
  
})

Router.patch("/", (req, res) => {
    const { data } = req.body;
    console.log( "data" );
    console.log( data );
    MyPredefinesController.update(data, SubInterestModal, "Sub Interest")
    .then(result => {
        return res.json(result).status(200);
    })
    .catch(err => {
        return res.json(err).status(500);
    } )
})

Router.get("/", (req, res) => {
    const data = JSON.parse(req.query.data);
    console.log( "data" );
    console.log( data );
    MyPredefinesController.getList(data, SubInterestModal, "Sub Interest")
    .then(result => {
        return res.json(result).status(200);
    })
    .catch(err => {
        return res.json(err).status(500);
    } )
})

Router.delete("/:_id?",
    // Athorize,
    (req, res) => {
    const data = req.params._id;
    let interestController = new InterestsController();
    interestController.handleDeleteSubInterest(data)
        .then(deleted => {

            return res.json({success: true, subInterest: deleted}).status(200);
        }).catch(err => {
            return res.json({success: false, error: err.message}).status(500);
        })
    // MyPredefinesController.delete({_id: data}, SubInterestModal, "Sub Interest")
    // .then(result => {
    //     return res.json(result).status(200);
    // })
    // .catch( err => {
    //     return res.json(err).status(500);
    // } )
})  
module.exports = Router;



