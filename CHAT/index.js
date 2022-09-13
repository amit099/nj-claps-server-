const MyChatManagerObj = require("./myChatManager");
const UsersManagerObj = require("./usersManager");
const PushActionsManager = require("./pushActionsManager");

const MyChatManager = new MyChatManagerObj();
const UsersManager = new UsersManagerObj();

module.exports = {
    MyChatManager, 
    UsersManager, 
    PushActionsManager
}