
const passport = require("passport");
// const AuthError = require("passport");
module.exports = (req, res, next) => {
    console.log("passport jwt vlidator called");
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        console.log( "user" )
        console.log(user);
        if (err) return next(err);
        if (!user) return res.json({ error: { message: "Invalid Token", errorCode: 404 }, success: false });
        if (user) req.user = user;
        next();
    })(req, res, next);

}