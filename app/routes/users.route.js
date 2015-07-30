var express = require('express');
var router = express.Router();

var UserController = require('../controllers/user.controller');

var ctrl = new UserController();
module.exports = function(app) {
 
  router.route('/users')
   .post(ctrl.userSignup)
   .get(ctrl.getUsers)
   .delete(ctrl.deleteAll);

  app.use('/api', router);
};