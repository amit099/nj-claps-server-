const bcrypt = require("bcryptjs");
module.exports = async (data) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(data.password, data.emailPassword, (err, isMatch) => {
            if (isMatch) {
                resolve({ success: true });
            } else {
                resolve ({err, success: false });
            }
        })
    })
}