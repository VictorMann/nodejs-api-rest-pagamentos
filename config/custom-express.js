var express = require("express");
var consign = require("consign");
var bodyParser = require("body-parser");

module.exports = function () {
    var app = express();

    // aplicando middlewares
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    // auto-loader passando param
    consign()
    .include("controllers")
    .into(app);

    return app;
}