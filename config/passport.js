'use strict';

require('../app/models/user.model');
var mongoose = require('mongoose'),
 passport = require('passport'),
 User = mongoose.model('User'),
 googleStrategy = require('passport-google-oauth').OAuth2Strategy,
 config = require('./config');

function makePassword() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i=0; i < 7; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

module.exports = function() {
  
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
          newUser.password = makePassword();
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
  }));
};