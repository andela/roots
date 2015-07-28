'use strict';
var signUproute = require('./users.route');
var logInroute = require('./login.route');

module.exports = function(router) {
  signUproute(router);
  logInroute(router);
};