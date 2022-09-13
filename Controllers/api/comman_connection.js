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