'use strict';
var passport = require('passport');
var authController = function() {};

authController.prototype.authCallback = function(strategy) {
  return function(req, res, next) {
    passport.authenticate(strategy, function(err, user) {
      if(err) {
        console.log('err', user);
        return next(err);
      }
      if(!user){
        console.log('err, no user', user);
        res.redirect('/#/home');
      }
      else {
        console.log('user', user);
        res.redirect('/#/home');
      }
    })(req, res, next);
  };
};

module.exports = authController;
