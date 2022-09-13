const Router = require('express').Router();


Router.use("/user", require("../Api/User"));
Router.use("/verification", require("../Api/Verfications"));
Router.use("/chat", require('../Api/chat/chatAPI'));

module.exports = Router;