'use strict';
var userRoute = require('./users.route');

module.exports = function(app) {
  userRoute(app);
};