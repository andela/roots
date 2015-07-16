'use strict';

require('../models/user.model');

var mongoose = require('mongoose');
var config = require('../../config/database.config');
var User = mongoose.model('User');


exports.userSignup = function(req, res) {

};