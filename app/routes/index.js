'use strict';
var userRoute = require('./users.route');
var loginRoute = require('./login.route');
var express = require('express');
var router = express.Router();

module.exports = function(app) {
  userRoute(router);
  loginRoute(router);
  app.use('/api', router);
  app.use(function(req, res, next) {
    res.status(404).json({error: "The path does not exists"});
    next();
  });
};