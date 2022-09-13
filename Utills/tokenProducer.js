
const jwt = require("jsonwebtoken");
const secretOrKey = require("../Config/db").secretOrKey;
module.exports = (payload, duration) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secretOrKey, { expiresIn: duration  }, (err, token) => {
            if (err) {
                reject ({ error: { message: "Failed, Token Creation", errorCode: 500 }, success :false });
            } else {
                resolve({ message: "Success Message", token: "Bearer " + token, success: true });
            }
        } )
    })
}