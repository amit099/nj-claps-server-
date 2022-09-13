const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const secretOrKey = require("./db").secretOrKey;

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secretOrKey;

module.exports = passport => {
    console.log(opts.jwtFromRequest);
    console.log( "opts.jwtFromRequest" )
    if ( opts.jwtFromRequest && opts.secretOrKey ) {
        passport.use(
            new JwtStrategy(opts, (jwt_payload, done) => {
                console.log("jwt_payload----");
                
                console.log(jwt_payload);
                  done( null, { message: "User", user: jwt_payload } )
            })
        )
    } else {
        return { msg: "Token Not Found", errorCode: 500, success: false }
    }
    
}