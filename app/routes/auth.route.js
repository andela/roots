var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth.controller');
var auth = new authController();
module.exports = function(app, passport) {
 
  router.route('/auth/google')
   .get(passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
   }));
  router.route('/auth/google/callback')
   .get(auth.authCallback('google'));

   app.use('', router);
};