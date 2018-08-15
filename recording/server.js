
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http_server = require("http").Server(app);
const logger = require("./modules/logger").get("es");
const RecorderManager = require("./modules/recorder").RecorderManager;
const Api = require("./modules/api.js");


logger.info(`start in ${process.env.NODE_ENV} mode`);


function initProcess(application) {
    // parse application/json
    application.use(bodyParser.json());
    application.use(bodyParser.urlencoded({ extended: false }));

    // Add headers
    application.use(function (req, res, next) {
        // Website you wish to allow to connect
        res.setHeader("Access-Control-Allow-Origin", "*");

        // Request methods you wish to allow
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

        // Request headers you wish to allow
        res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        // res.setHeader("Access-Control-Allow-Credentials", true);

        // Pass to next layer of midd leware
        next();
    });
}

//master node
initProcess(app);
let recManager = new RecorderManager();
Api(recManager, app);
http_server.listen(process.env.PORT || 3233);