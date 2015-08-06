'use strict';

require('../app/models/user.model');
var mongoose = require('mongoose'),
 passport = require('passport'),
 User = mongoose.model('User'),
 googleStrategy = require('passport-google-oauth').OAuth2Strategy,
 TwitterStrategy = require('passport-twitter').Strategy,
 config = require('./config');

module.exports = function() {
  
  passport.use(new TwitterStrategy({
      consumerKey: config.twitter.consumerKey,
      consumerSecret: config.twitter.consumerSecret,
      callbackURL: '/auth/twitter/callback',
      passReqToCallback: true
    },
      function(req, token, tokenSecret, profile, done) {
        process.nextTick(function() {
          User.findOne({ firstname : profile._json.screen_name}, function (err, user) {
            if(err) {
              return done(err);
            }
            if(user) {

              return done(null, user);
            }
            else {
              var newUser = new User();
              newUser.firstname = profile._json.screen_name;
              newUser.lastname = profile._json.name;
              newUser.email = profile._json.screen_name + '@mail.com';
              newUser.save(function(err, user) {
                  if (err) {
                    throw err;
                  }
                  return done(null, user);  
              });
            }
          });
        });
      }
  ));



  //google strategy
  passport.use(new googleStrategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: '/auth/google/callback',
      passReqToCallback: true
    }, 

    function(req, accessToken, refreshToken, profile, done) {
      process.nextTick(function() {
        User.findOne({email: profile._json.emails[0].value}, function(err, user) {
          if(err){
            return done(err);
          }
          if(user) {
            return done(null, user);
          }
          else {
            var newUser = new User();
            newUser.lastname = profile._json.name.familyName;
            newUser.firstname = profile._json.name.givenName;
            newUser.email = profile._json.emails[0].value;
            newUser.gender = profile._json.gender;
            newUser.save(function(err, user){
              if(err){
                return done(err);
              }
              return done(null, user);
            });
          }
        });
      });
    }
  ));
};
