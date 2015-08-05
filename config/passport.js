'use strict';

require('../app/models/user.model');
var mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User'),
  FacebookStrategy = require('passport-facebook').Strategy,
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  config = require('./config');

module.exports = function() {

  //google strategy
  passport.use(new GoogleStrategy({

      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
      process.nextTick(function() {
        User.findOne({
          email: profile._json.emails[0].value
        }, function(err, user) {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, user);
          } else {
            var newUser = new User();
            newUser.lastname = profile._json.name.familyName;
            newUser.firstname = profile._json.name.givenName;
            newUser.email = profile._json.emails[0].value;
            newUser.gender = profile._json.gender;
            newUser.save(function(err, user) {
              if (err) {
                return done(err);
              }
              return done(null, user);
            });
          }
        });
      });
    }));

  passport.use(new FacebookStrategy({

      // pull in our app id and secret from our auth.js file
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: '/auth/facebook/callback'

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

      // asynchronous
      process.nextTick(function() {

        // find the user in the database based on their facebook id
        User.findOne({
          'facebook.id': profile.id
        }, function(err, user) {

          if (err)
            return done(err);

          // if the user is found, then log them in
          if (user) {
            return done(null, user); // user found, return that user
          } else {
            // if there is no user found with that facebook id, create them
            var newUser = new User();
            console.log(profile);

            // set all of the facebook information in our user model
            newUser.facebook.id = profile.id;
            newUser.facebook.token = token;

            if (profile.name.givenName)
              newUser.firstname = profile.name.givenName;

            if (profile.name.familyName)
              newUser.lastname = profile.name.familyName;

            newUser.facebook.displayName = profile.displayName;


            if (profile.emails && profile.emails.length > 0)
              newUser.email = profile.emails[0].value;

            // save our user to the database
            newUser.save(function(err) {
              if (err)
                return done(err);

              // if successful, return the new user
              return done(null, newUser);
            });
          }

        });
      });

    }));
};
