const Router = require("express").Router();
const { MainInterestModal } = require("../../Modals");
const MyPredefinesController = require("../../Controllers/predefines");
Router.post("/", (req, res) => {
    const { data } = req.body;
    MyPredefinesController.add(data, MainInterestModal, "Main Interest")
    .then(result => {
        return res.json(result).status(200);
    })
    .catch(err => {
        return res.json(err).status(500);
    } )
})

Router.patch("/", (req, res) => {
    const { data } = req.body;
    console.log( "data" );
    console.log( data );
    MyPredefinesController.update(data, MainInterestModal, "Main Interest")
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
    MyPredefinesController.getList(data, MainInterestModal, "Main Interest")
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
    MyPredefinesController.delete({_id: data}, MainInterestModal, "Main Interest")
    .then(result => {
        return res.json(result).status(200);
    })
    .catch( err => {
        return res.json(err).status(500);
    } )
})  
module.exports = Router;



