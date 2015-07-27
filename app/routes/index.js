'use strict';
var signUproute = require('./signup.route');
var logInroute = require('./login.route');

module.exports = function(router) {
  signUproute(router);
  logInroute(router);
};