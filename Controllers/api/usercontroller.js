const User = require('../../Modals/user');
// var MongoClient = require('mongodb').MongoClient;
const mongoose = require("mongoose");
var validator = require('validator');
const jwt = require('jsonwebtoken');
const db = mongoose.connection;
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
 app.use(express.json());
 app.use(bodyParser.urlencoded({extended:true}));
 app.use(bodyParser.json());
const path = require('path');
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


// router.get('/',function(req,res){
//   //__dirname : It will resolve to your project folder.
// });


//add user
exports.add_user = function (req, res) {
// console.log(Object.keys(req.body));
      const user = new User(req.body);

        try { 
           db.collection("users").findOne({"email": req.body.email},function(err, userdata){
            if(err) throw err;

            if(userdata){
               return res.json({status:false,message:"User already taken"});
            }
            else{
               db.collection("users").insertOne(user); 
          res.json({status:true, message:"User details successfully added",data: user});

            }
           
            });         
        } catch (error) {
              res.status(500).send(error);
            }
    };


// singnin
 exports.sign_in = function(req, res) {

     try { 

const user = new User(req.body);

if(!req.body.email){
return res.status(200).json({ status:false,message: 'Please enter email and password!' });
}
else{

 db.collection("users").findOne({email: req.body.email,password: req.body.password}, function(err, users) {
    if (err) throw err;
      if(!users){
      return res.status(401).json({ status:false,message: 'Authentication failed. Invalid user or password.' });
    }

    db.collection("users").findOne({"email": req.body.email},function(err, userdata){
      if(err) throw err;
      return res.status(200).json({status:true,message:"User login successfully", token: jwt.sign({ email: user.email}, 'RESTFULAPIs'),data:userdata});
      });

    });
}
}
 catch (error) {
              res.status(500).send(error);
            }
};

 
