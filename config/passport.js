var FacebookStrategy = require('passport-facebook').Strategy;

// load up the user model
var User = require('../app/models/user.model');

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
      clientID: configAuth.facebookAuth.clientID,
      clientSecret: configAuth.facebookAuth.clientSecret,
      callbackURL: configAuth.facebookAuth.callbackURL

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

            if(profile.name.givenName)
                newUser.firstname = profile.name.givenName;            

            if(profile.name.familyName)
                newUser.lastname = profile.name.familyName;

               newUser.facebook.displayName = profile.displayName;
        
            
            if(profile.emails && profile.emails.length > 0)
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
