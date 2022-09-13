const Router = require('express').Router();

Router.use("/maininterests", require("../Api/Predefines/mainInterest"));
Router.use("/subinterests", require("../Api/Predefines/subInterest"));


module.exports = Router;