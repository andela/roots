'use strict';

require('../app/models/user.model');
var mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User'),
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  TwitterStrategy = require('passport-twitter').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy,
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
  passport.use(new GoogleStrategy({
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
            var profilePic = profile._json.image.url;
            newUser.profilePic = profilePic.slice(0, -6);
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

  passport.use(new TwitterStrategy({
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret,
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true
  },
    function(req, token, tokenSecret, profile, done) {
      process.nextTick(function() {
        User.findOne({ firstname : profile._json.screen_name}, function (err, user) {
          if(err){
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

  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'gender', 'email', 'first_name', 'last_name'],
    enableProof: false
  },
    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {
      // asynchronous
      process.nextTick(function() {

        // find the user in the database based on their facebook id
        User.findOne({
          'email': profile.emails[0].value
        }, function(err, user) {

          if (err) {
            return done(err);
          }
          // if the user is found, then log them in
          if (user) {
            return done(null, user);
          } 
          else {
            var newUser = new User();
            newUser.firstname = profile.name.givenName;
            newUser.lastname = profile.name.familyName;
            newUser.gender = profile.gender;
            
            if (profile.emails && profile.emails.length > 0) {
              newUser.email = profile.emails[0].value;
            }

            // save our user to the database
            newUser.save(function(err) {
              if (err) {
                return done(err);
              }

              return done(null, newUser);
            });
          }
        });
      });
    }
  ));
};

