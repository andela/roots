var express = require('express');
var UserController = require('../controllers/user.controller');
var verifyToken = require('../../config/tokenMiddleware');
var UserCtrl = new UserController();

module.exports = function(router) {
	router.route('/signup')
		.post(UserCtrl.createUser);

	router.route('/users')
		.post(verifyToken, UserCtrl.getUsers)
		.delete(verifyToken, UserCtrl.deleteAll);
}