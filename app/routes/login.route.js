var express = require('express');
var LoginCtrl = require('../controllers/logIn.controller');
var verifyToken = require('../../config/tokenMiddleware');
//var secret = 'swift';

module.exports = function(router) {
	router.route('/login')
		.post(LoginCtrl.auth);

	router.route('/users/:user_id')
		.post(verifyToken, LoginCtrl.currentUser)
		.delete(verifyToken, LoginCtrl.deleteUser);
}