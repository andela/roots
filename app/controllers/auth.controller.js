'use strict';
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../../config/config');
var authController = function() {};

authController.prototype.authCallback = function(strategy) {
  return function(req, res, next) {
    passport.authenticate(strategy, function(err, user) {
      if(err) {
        return next(err);
      }
      if(!user){
        res.redirect('/#/home');
      }
      else {
        // console.log('req.user', user);
        var token = jwt.sign(user, config.secret, {
            expiresInMinutes: 1440 //24hr expiration
        });
        res.redirect('/#/home?token=' + token);
      }
    })(req, res, next);
  };
};

module.exports = authController;
