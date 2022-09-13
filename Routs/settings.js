const Router = require('express').Router();

Router.use("/user", require("../Api/User/settings"));

module.exports = Router;