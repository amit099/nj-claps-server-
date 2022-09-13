const express = require("express");
const mongoose = require("mongoose");
const routes = require('./Routs/myroute');
const app = express();
app.use(express.json());
const path = require('path');
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


// mongodb://127.0.0.1:27017/velu

mongoose.connect('mongodb://127.0.0.1:27017/velu',
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
console.log("Database Connected successfully");

 app.get("/", (req, res) => {
            return res.json({ message: "Claps app Server Running..." }).status(200);
 });
 app.use('/claps', routes);

  app.get('/ss', function(req, res){
    res.render('index', {
    })
})

});

var port = 4000;
app.listen(port, function () {
  console.log("app listening on port " + port);
});