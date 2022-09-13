class UserDataAdapter{
    constructor(){
        this.toPublicJSON = (user) => {
            return {
                _id: user._id, 
                phoneNumber: user.phoneNumber, 
                username: user.username, 
                thumbnail: user.thumbnail, 
                imageUrl: user.imageUrl
            }
        }
    }
}
const MyUserDataAdapter = new UserDataAdapter();
module.exports = MyUserDataAdapter;