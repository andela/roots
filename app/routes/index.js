'use strict';
var userRoute = require('./users.route');
var authRoute = require('./auth.route');

module.exports = function(app, passport) {
  userRoute(app);
  authRoute(app, passport);


  app.use(function(req, res, next) {
    res.status(404).json({error: "The path does not exists"});
    next();
  });
};