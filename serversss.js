const express = require("express");
const mongoose = require("mongoose");
const routes = require('./Routs/myroute');
const app = express();
app.use(express.json());


//mongoose.connect('mongodb+srv://velu:mangodb@cluster0.7gv7fkg.mongodb.net/velu?retryWrites=true&w=majority',
  mongoose.connect('mongodb+srv://theclapsapp:Q19QKYvAreVnGkxi@cluster0.zrgjh.mongodb.net/theclapsapp?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
);

  //mongoexport --uri mongodb+srv://theclapsapp:Q19QKYvAreVnGkxi@cluster0.zrgjh.mongodb.net/theclassapp --collection users --type JSON --out C:\users.json

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {

//export db
  // mongoexport --uri mongodb+srv://theclapsapp:Q19QKYvAreVnGkxi@cluster0.zrgjh.mongodb.net/theclapsapp --collection users --type json --out users.json

// mongoexport --uri="mongodb://localhost:27017/velu"  --collection=first  --out=first.json
console.log("Database Connected successfully");
//mongoexport --uri mongodb+srv://theclapsapp:Q19QKYvAreVnGkxi@cluster0.zrgjh.mongodb.net/theclapsapp --collection users --type json --out users

 app.get("/", (req, res) => {
            return res.json({ message: "Claps app Server Running..." }).status(200);
 });


 app.use('/claps', routes);

});

var port = 4000;
app.listen(port, function () {
  console.log("app listening on port " + port);
});
