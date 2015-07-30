var express = require('express');
var verifyToken = require('../../config/tokenMiddleware');
var UserController = require('../controllers/user.controller');
var ctrl = new UserController();

module.exports = function(router) {
 
  router.route('/users')
   .post(ctrl.userSignup)
   .get(verifyToken, ctrl.getUsers)
   .delete(verifyToken, ctrl.deleteAll);

  router.route('/authenticate')
  	.post(ctrl.authenticate);
};