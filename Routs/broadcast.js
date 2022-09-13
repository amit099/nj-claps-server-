const Router = require("express").Router();

Router.use("/broadcast", require("../Api/broadcast"));

module.exports = Router;