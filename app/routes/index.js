var express = require('express');
var router = express.Router();
var cors = require('cors');
var config = require('../../config/cors.config');

module.exports = function(app) {
  var UserCtrl = require('../controllers/user.controller');

  router.route('/')
    .get(function(req, res) {
      res.send('Welcome to World Tree Inc');
    });

   router.route('/users')
    .post(UserCtrl.userSignup)
    .get(UserCtrl.getUsers)
    .delete(UserCtrl.deleteAll);

  app.use(cors(config.corsOptions));

  app.use('/api', router);

  app.use(function(req, res, next) {
    res.status(404).json({error: "The path does not exists"});
    next();
  });
};