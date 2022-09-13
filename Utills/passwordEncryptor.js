const bcrypt = require("bcryptjs");
module.exports = async (data) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                reject ({ error: { message: "Salt Generation Error", errorCode: 500 }, success: false });
            } else {
                bcrypt.hash(data , salt, (err, hash) => {
                    if (err) {
                        reject({ error: { message: "Hash creation Error", errorCode: 500 }, success: false });
                    } else {
                        resolve( { success: true, hash } )
                    }
                })
                
            }
        })
    })
}