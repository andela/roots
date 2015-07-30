var express = require('express');
var LoginController = require('../controllers/login.controller');
var loginCtrl = new LoginController();
var verifyToken = require('../../config/tokenMiddleware');

module.exports = function(router) {
 
  router.route('/login')
   .post(loginCtrl.auth);

  router.route('/users/:user_id')
   .post(verifyToken,loginCtrl.getCurrentUser)
   .delete(verifyToken,loginCtrl.deleteCurrentUser);
};