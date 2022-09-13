const Router = require('express').Router();

Router.use("/", require("../Api/streams"));
module.exports = Router;