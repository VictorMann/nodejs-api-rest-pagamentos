var express = require("express");
var consign = require("consign");
var bodyParser = require("body-parser");
var expressValidator = require("express-validator");

module.exports = function () {
    var app = express();

    // aplicando middlewares
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(expressValidator());

    // auto-loader passando param
    consign()
    .include("controllers")
    .into(app);

    return app;
}