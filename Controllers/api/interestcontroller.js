const Subintereset = require('../../Modals/subInterest');
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


 exports.interest = function(req,res) {

       try {  
          
            db.collection("tblsubInterest").find({}).toArray(function(err, result) {
              if (err) throw err; 




           result.forEach(elements => {
            // console.log(elements._id);

               db.collection("tblmainInterets").find({"subType":elements._id}).toArray(function(err, result1) {

                 // result1.category_name = elements.title;
                 const category_name = elements.title;

                 // arr_data = push(result1);

                 //      console.log(arr_data);
// console.log(result1);
result1.forEach((element) => {
    // console.log(element.x); // 100, 200, 300
    // // console.log(index); // 0, 1, 2
    // console.log(element); // same myArray object 3 times

   let jsondata = {

          "category_name":category_name,
          "details":result1
    }


// console.log(jsondata);
    // return res.status(200).json({status:true,message:"Interest data success",data:jsondata});

  return res.status(200).json({jsondata});
});




                
                 // interestdata = JSON.stringify(result1);

                  // return res.status(200).json({status:true,message:"Interest data success",data:interestdata});


                

                  //return res.status(200).json({category_name});

                      
                          });


    
                         });



 


            });
          }catch (error) {
              res.status(500).send(error);
            }
            
        };






exports.interestt = function(req,res) {

  try {  

          
            db.collection("tblsubInterest").find({}).toArray(function(err, result) {
              if (err) throw err; 


           result.forEach(elements => {
               db.collection("tblmainInterets").find({"subType":elements._id}).toArray(function(err, result1) {
                 const category_name = elements.title;




                 // console.log(result1);



          result1.forEach((element) => {
                // console.log(element.x); // 100, 200, 300
                // // console.log(index); // 0, 1, 2
                // console.log(element); // same myArray object 3 times
                
                 let jsondata = [{
                        "category_name":category_name,
                        "details":result1
                  }]

                 // let jsondata = [{
                 //    "service_id" : element._id,
                 //    "servic_name" : element.title
                 //  }];
                 

                   //res.status(200).json({status:true,message:"Interest data success",data:jsondata});
              
               // return res.send(jsondata);

// console.log(jsondata);
              });
      
          });


         });



 


            });
          }catch (error) {
              res.status(500).send(error);
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

