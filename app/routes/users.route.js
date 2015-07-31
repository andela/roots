var express = require('express');
var passport = require('passport');

var jwt = require("jsonwebtoken");

var env = process.env.NODE_ENV || "development";
var config = require('../../config/jwt.config');

var JWT_SECRET = config[env];


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
      scope: ["email"]
    })
  );

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      session: false,
      failureRedirect: "/"
    }),
    function(req, res) {
      console.log(req.user);

      var token = jwt.sign({
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email

      }, JWT_SECRET);

      res.redirect("/#/home?token=" + token);
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
