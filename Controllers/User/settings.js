const { UserModal } = require("../../Modals");
const { updateInteraestValidator } = require("../../Validators/user");
class UserSettingClass {
    constructor() {
        this.respDeal = (err, Emittor, eMessage) => {
            if (err?.isJoi === true) {
                Emittor({
                error: { err, message: err.message, errorCode: 500 },
                success: false,
              });
            } else {
                Emittor({
                error: { err, message: eMessage, errorCode: 500 },
                success: false,
              });
            }
        };
        this.updateInterests = (data) => {
            return new Promise((resolve, reject) => {
                updateInteraestValidator.validateAsync(data)
                    .then(validated => {
                        UserModal.findOne({
                            _id: data._id
                        })
                            .then(async resp_User => {
                                if (resp_User) {
                                    resp_User.interests = data.interests;
                                    await resp_User.save();
                                    resolve({ message: "User Interest Updated", success: true });
                                } else {
                                    this.respDeal({}, reject, "Invalid User Id");
                                }
                            })
                            .catch(err => {
                                this.respDeal(err, reject, "Catch Error, Getting User");
                        } )
                    })
                    .catch(err => {
                    this.respDeal( err, reject, "Catch Error, Validation" )
                } )
               
            })
        }
    }
}
const MyUserSettingController = new UserSettingClass();
module.exports = MyUserSettingController; 