var express = require('express');
var router = express.Router();
var AuthController = require('../controllers/auth.controller');
var auth = new AuthController();
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

  router.route('/auth/facebook')
    .get(passport.authenticate('facebook', {
      session: false,
      scope: ["email"]
    }));
  router.route('/auth/facebook/callback')
    .get(auth.authCallback('facebook'));

  app.use('', router);
};
