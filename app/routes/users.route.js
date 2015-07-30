var express = require('express');
var passport = require('passport');


var router = express.Router();

require('../../config/passport')(passport);

var UserController = require('../controllers/user.controller');

var ctrl = new UserController(passport);

module.exports = function(app) {

  router.route('/users')
    .post(ctrl.userSignup)
    .get(ctrl.getUsers)
    .delete(ctrl.deleteAll);

  app.use(passport.initialize());

  app.get(
    '/auth/facebook',
    passport.authenticate('facebook', {
      session: false,
      scope: []
    })
  );

  //I will pass all the user data as token, and parse it at the frontend
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      session: false,
      failureRedirect: "/"
    }),
    function(req, res) {
      console.log(req.user);
      res.redirect("/?displayName=" + req.user.facebook.displayName);
    }
  );
  app.use('/api', router);
  app.use(function(req, res, next) {
    res.status(404).json({
      error: "The path does not exists"
    });
    next();
  });
};
