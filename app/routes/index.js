var express = require('express');
var router = express.Router();
var cors = require('cors');
var config = require('../../config/cors.config');

module.exports = function(app) {
	var userCtrl = require('../controllers/user.controller');

  router.route('/')
    .get(function(req, res) {
      res.send('Welcome to World Tree Inc');
    });

   router.route('/users')
    .post(userCtrl.userSignup)
    .get(userCtrl.getUsers)
    .delete(userCtrl.deleteAll);

  app.use(cors(config.corsOptions));

  app.use('/api', router);
};
