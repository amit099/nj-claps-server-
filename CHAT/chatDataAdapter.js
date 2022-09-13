class MySingleUserChat{
    constructor(){
        this._id = "";
        this.cid = "";
        this.title= "";
        this.user = {_id: "", username: ""};
        this.messages =  [];
        this.unseenCount = 0;
        this.lastMessage = {};
        this.chatType = "single"
        this.chatStatus = 2;
       

        this.setAttributes = ( messages, selected, unseenCount = 0) => {
            // this.user =user;
            // this.cid = user._id ;
            // this.title=user.username;
            // this.messages = messages;
            // this.selected = selected;
            // this.unseenCount = unseenCount;
            return this;
        }
        this.transform = (userId ,sc) => {
            if(sc.users[1]._id.toString() == userId){
                this.cid = sc.users[0]._id;
                this.user =sc.users[0];
            }else{
                this.cid = sc.users[1]._id;
                this.user = sc.users[1];
            }
            if(sc.title){
                this.title = sc.title;
            }else{
                this.title = this.user.username? this.user.username: this.user.fullName;
            }
            this._id = sc._id;
            this.messages = sc.messages;
            // this.chatStatus = sc.chatStatus;
            this.lastMessage = sc.messages[sc.messages.length -1];
            return this;
        }
    }
}


class MyGroupChat{
    constructor(){
        this._id = "";
        this.cid = "";
        this.title= "";
        this.users = []
        this.messages =  [];
        this.unseenCount = 0;
        this.lastMessage = {};
        this.chatType = "group";
        this.chatStatus = 0;
        this.admins = [];
        this.icon = {
            thumbnail: "", 
            orignal: ""
        }

        this.setAttributes = ( messages, selected, unseenCount = 0) => {
            // this.user =user;
            // this.cid = user._id ;
            // this.title=user.username;
            // this.messages = messages;
            // this.selected = selected;
            // this.unseenCount = unseenCount;
            return this;
        }
        this.transform = (userId ,sc) => {
            this.cid = sc._id;
            this.title = sc.title;
            this._id = sc._id;
            this.messages = sc.messages;
            this.users = sc.users;
            // this.chatStatus = sc.chatStatus;

            this.lastMessage = sc.messages[sc.messages.length -1];
            this.admins = sc.admins;
            if(sc.icon){
                this.icon.thumbnail =  sc.icon.thumbnail;
                this.icon.orignal = sc.icon.orignal;
            }
            return this;
        }
    }
}





class ChatDataAdapter{
    constructor(userId){
        this.userId = userId;
        this.userChat = [];
        this.singleChat = {};
        this.message = {};


        this.transformUserChat = (userChat) => {
            let chat = [];
            for (let index = 0; index < userChat.length; index++) {
                if(userChat[index].chatType === "single"){
                    chat.push(new MySingleUserChat().transform(this.userId, userChat[index]))
                }else{
                    chat.push(new MyGroupChat().transform(this.userId, userChat[index]))
                }
            }
            return chat;
        }
        this.transformSingleUserChat = (singleChat) => {
            return new MySingleUserChat().transform(this.userId, singleChat)
        }
    }
}


module.exports = (userId) => {
    return new ChatDataAdapter(userId)
};