'use strict';
var userRoute = require('./users.route');
var loginRoute = require('./login.route');
module.exports = function(app) {
  userRoute(app);
  // loginRoute(app);

  app.use(function(req, res, next) {
    res.status(404).json({error: "The path does not exists"});
    next();
  });
};