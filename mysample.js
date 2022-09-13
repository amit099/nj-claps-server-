const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const routes = require('./Routs/myroute'); // Imports routes for the products
const app = express();

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));


const db = require("./Config/mydb").mongodbOnline;
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(m => {
        // global.mongodbconndbs = m.connection;
        console.log("db connected")

        // require("./Config/passport")(passport);
        // ///////////////// API ROUTES ////////////////
        // app.use("/auth", cors(corsOptions), require("./Routs/auth"));
        // app.use("/settings", cors(corsOptions), require("./Routs/settings"));
        // app.use("/predefines", cors(corsOptions), require("./Routs/predefines"));
        // app.use("/rt", cors(corsOptions), require("./Routs/broadcast"))
        // app.use("/follow", cors(corsOptions), require("./Api/follow"))
        // app.use("/test", cors(corsOptions), require('./Api/test'))
        // app.use("/streams", cors(corsOptions), require('./Routs/streams'))
        // app.use("/stories", cors(corsOptions), require("./Api/stories"))
        app.get("/", (req, res) => {
            return res.json({ message: "Claps app Server Running..." }).status(200);
        });
        app.use('/claps', routes);

    })
    .catch(err => {
        console.log(err);
        console.log("Catch Error, db Connectivity ");
    })

///////////// PORT ENVOIRMENT //////////////////
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
    console.log(`SERVER RUNNING AT PORT ${port}`);
});
// let port = 1234;
// app.listen(port, () => {
//     console.log('Server is up and running on port numner ' + port);
// });