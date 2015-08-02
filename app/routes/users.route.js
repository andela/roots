var express = require('express');
var UserController = require('../controllers/user.controller');
var ctrl = new UserController();
var router = express.Router();

module.exports = function(app) {
 
  router.route('/users')
   .post(ctrl.userSignup)
   .get(ctrl.getUsers)
   .delete(ctrl.deleteAll);

  router.route('/users/:user_id')
   .get(ctrl.getCurrentUser)
   .put(ctrl.editUser)
   .delete(ctrl.deleteCurrentUser);

  router.route('/authenticate')
  	.post(ctrl.authenticate);

  router.route('/decode')
    .get(ctrl.verifyToken, ctrl.decodeUser);

  app.use('/api', router);
};