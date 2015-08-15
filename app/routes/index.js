'use strict';
var userRoute = require('./users.route');
var express = require('express');
var authRoute = require('./auth.route');
var passport = require('passport');
var organizerRoute = require('./organizer.route');

module.exports = function(app) {
  userRoute(app);
  authRoute(app, passport);
  organizerRoute(app);
  
  app.use(function(req, res, next) {
    res.status(404).json({error: "The path does not exists"});
    next();
  });
};