const Router = require('express').Router();
const MyVerificationController = require("../../Controllers/verifications");
const otpToken = require("../../Config/otpToken");


Router.post( "/send", ( req, res ) =>{
    const { data }  = req.body;
    MyVerificationController.sendCode( data )
    .then( result =>{
        return res.json( result ).status( 200 );
    } ) 
    .catch( err => {
        return res.json( err ).status( 500 );
    } )
})

Router.get( "/", ( req, res ) =>{
    MyVerificationController.list(  )
    .then( result =>{
        return res.json( result ).status( 200 );
    } ) 
    .catch( err => {
        return res.json( err ).status( 500 );
    } )
})

Router.delete("/:_id?", (req, res) => {
    const data = req.params._id;
    MyVerificationController.deleteVerification( { _id: data } )
    .then( result =>{
        return res.json( result ).status( 200 );
    } ) 
    .catch( err => {
        return res.json( err ).status( 500 );
    } )
})

Router.post( "/verify", ( req, res ) =>{
    const {data}  = req.body; 
    MyVerificationController.varifyCodes( data )
    .then( result =>{
        return res.json( result ).status( 200 );
    } ) 
    .catch( err => {
        return res.json( err ).status( 500 );
    } )
})


Router.post("/verifylink",
otpToken,
    (req, res) => {
        //  data.user  = req.user.user.user;
        // return res.json({ data: req.user.user.user });

    MyVerificationController.varifyLinks( req.user.user.user )
    .then( result =>{
        return res.json( result ).status( 200 );
    } ) 
    .catch( err => {
        return res.json( err ).status( 500 );
    } )
})

module.exports = Router;