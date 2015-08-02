'use strict';
var userRoute = require('./users.route');
var express = require('express');
var authRoute = require('./auth.route');
var passport = require('passport');

module.exports = function(app) {
  userRoute(app);
  authRoute(app, passport);

  app.use(function(req, res, next) {
    res.status(404).json({error: "The path does not exists"});
    next();
  });
};