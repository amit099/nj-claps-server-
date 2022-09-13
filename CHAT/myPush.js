class MyPush {
    static TEXT_MESSAGE = 1;
    static IMAGE_MESSAGE = 2;
    static VIDEO_MESSAGE = 3;

    static CALL = 5;

    static SETVER_ACTION_REMOVE_PUSHES = 6;
    static SETVER_ACTION_REMOVE_PUSH = 10;
    static USER_NEW_PUSH_ACTION = 7;


    ///////////// 
    static MESSAGE = 8;
    static ACK_MESSAGE = 9;
    static MESSAGE_INITIAL = 10;

    constructor(){
        this._id = "";
        this.localId = 0;
        this.pushType = 0;
        this.payload = null;
    }
}

module.exports = MyPush;