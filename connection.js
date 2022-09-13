var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const route = require('./Routs/myroute');
// var mongoose = require("mongoose");

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://0.0.0.0:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database connect");

  app.get("/", (req, res) => {
            return res.json({ message: "Claps app Server Running..." }).status(200);
        });
  app.use('/claps', route);


// var dbo = db.db("velu");
//insert
// var myobj = { "name": "kumar"};
//   dbo.collection("first").insertOne(myobj, function(err, res) {
//     if (err) throw err;
//     console.log("Data inserted successfully");
//   db.close();
// });

//select
  // dbo.collection("first").findOne({"name":"velu"}, function(err, result) {
  //   if (err) throw err;
  //   console.log(result.name);
  //   db.close();
  // });


});



var port = 4000;
app.listen(port, function () {
  console.log("app listening on port " + port);
});