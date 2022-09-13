const Router = require("express").Router();
const MyUserSettingController = require("../../Controllers/User/settings");
const passportJwtValidator = require("../../Config/passportJwtValidator");
const MySocialLinksManager = require("../../Controllers/User/socialLinks");

Router.patch("/interests",
    passportJwtValidator,
    (req, res) => {
        const { data } = req.body;
        data._id = req.user.user.user._id;
        MyUserSettingController.updateInterests(data)
        .then(result => {
            return res.json(result).status(200);
        })
        .catch(err => {
            return res.json(err).status(500).status(500);
        } )
} )

Router.patch("/social-link", (req, res) => {
    const {userId, linkType, value} = req.body;
    MySocialLinksManager.createOrUpdate(userId, linkType, value)
        .then(updated => {
            res.json({links: updated, success:true}).status(200)
        }).catch(err => {
            res.json(err).status(500);
        })
})

Router.get("/social-link/:_id", (req, res) => {
    MySocialLinksManager.getLinksByUserId(req.params._id)
    .then(links => {
        res.json({links, success:true}).status(200)
    }).catch(err => {
        res.json(err).status(500);
    })
})

module.exports = Router;