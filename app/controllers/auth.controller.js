'use strict';
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('../../config/config');
var AuthController = function() {};

AuthController.prototype.authCallback = function(strategy) {
  return function(req, res, next) {
    passport.authenticate(strategy, function(err, user) {
      if(err) {
        return next(err);
      }
      if(!user){
        res.redirect('/#/user/home');
      }
      else {

        var token = jwt.sign(user, config.secret, {
            expiresInMinutes: 1440 //24hr expiration
        });
        res.redirect('/#/user/home?token=' + token);
      }
    })(req, res, next);
  };
};

AuthController.prototype.twitterAuthCallback = function(strategy) {
  return function(req, res, next) {
    passport.authenticate(strategy, function(err, user) {
      if(err) {
        return next(err);
      }
      if(!user){
        res.redirect('/#/user/home');
      }
      else {
          if(user.mailChanged) {
            var token = jwt.sign(user, config.secret, {
              expiresInMinutes: 1440 //24hr expiration
            });
            res.redirect('/#/user/home?token=' + token);
          }
          else {
            var twitToken = jwt.sign(user, config.secret, {
              expiresInMinutes: 1440 //24hr expiration
            });
            res.redirect('/#/user/registration?twitToken=' + twitToken);
          }
      }
    })(req, res, next);
  };
};

module.exports = AuthController;
