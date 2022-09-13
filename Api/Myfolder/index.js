const Router = require("express").Router();

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

