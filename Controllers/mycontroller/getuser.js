const User = require('../../Modals/mymodel');
// var MongoClient = require('mongodb').MongoClient;
const mongoose = require("mongoose");
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

//search user

exports.test = function (req, res) {
// console.log(Object.keys(req));

const json = req.query;
const json_key = Object.keys(json);
const key_name = json_key[0];

//const new_json = '{"'+key_name+'": "'+new RegExp('.*'+json[key_name]+'.*')+'"}';
const new_json = '{"'+key_name+'": "'+json[key_name]+'"}';
const new_json_data = JSON.parse(new_json);

if(key_name == "username"){
db.collection("users").find({"username": new RegExp('.*'+json[key_name]+'.*')}).toArray(function(err, result) {
    if (err) throw err; 
    return res.json({ data: result }).status(200);  
  });
}
if(key_name == "name"){

  db.collection("tbltribes").find({"name": new RegExp('.*'+json[key_name]+'.*')}).toArray(function(err, result) {
    if (err) throw err; 
    return res.json({ data: result }).status(200);  
  });
}

if(key_name == "chatType"){

  db.collection("tbluserchats").find({"chatType": new RegExp('.*'+json[key_name]+'.*')}).toArray(function(err, result) {
    if (err) throw err; 
    return res.json({ data: result }).status(200);  
  });
}



// if(key_name == "chatType"){

//   db.collection("tbluserchats").find({}).toArray(function(err, result) {
//     if (err) throw err; 

//   const filteredUsers = result.filter(user => {
//     let isValid = true;
//     for (key in filters) {
//       console.log(key, user[key], filters[key]);
//       isValid = isValid && user[key] == filters[key];
//     }
//     return isValid;
//   });
//   res.send(filteredUsers);

//       //return res.json({ data: result }).status(200);  
//     });
//   }

   
};


//add user

    exports.add_user = function (req, res) {
        const user = new User(req.query);

        try {  
          db.collection("first").insertOne(user); 
          res.send(user);  
        } catch (error) {
          response.status(500).send(error);
        }
    };



//get user

      exports.get_all = function(req,res) {
        
          try {  
              db.collection("first").find({}).toArray(function(err, result) {
                  if (err) throw err;
                   res.send(result);  
                  }); 
            } catch (error) {
              res.status(500).send(error);
            }
            
        };


//get user indivudual

 exports.get_individual_user = function(req,res) {

    const user = new User(req.query);

          try {  
          db.collection("first").findOne({"email":user.email}, function(err, result) {
                  if (err) throw err;
                   res.send(result);  
                  }); 
            } catch (error) {
              res.status(500).send(error);
            }
            
        };

exports.newpage = function(req,res) {

    res.render('index', {
    })
};

