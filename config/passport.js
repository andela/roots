var FacebookStrategy = require('passport-facebook').Strategy;

// load up the user model
var User = require('../app/models/user.model');
var env = process.env.NODE_ENV || "development";

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });


  passport.use(new FacebookStrategy({

      // pull in our app id and secret from our auth.js file
      clientID: configAuth.facebook[env].clientID,
      clientSecret: configAuth.facebook[env].clientSecret,
      callbackURL: configAuth.facebook[env].callbackURL,
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

          if (err)
            return done(err);

          // if the user is found, then log them in
          if (user) {
            return done(null, user); // user found, return that user
          } else {
            
            var newUser = new User();
            console.log(profile);


            if (profile.name.givenName)
              newUser.firstname = profile.name.givenName;

            if (profile.name.familyName)
              newUser.lastname = profile.name.familyName;

            
            if (profile.emails && profile.emails.length > 0)
              newUser.email = profile.emails[0].value;

            // save our user to the database
            newUser.save(function(err) {
              if (err)
                return done(err);

              return done(null, newUser);
            });
          }

        });
      });

    }));

};
