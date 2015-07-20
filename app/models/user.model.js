'use strict';

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({

});


var User = mongoose.model('User', userSchema);

module.exports = User;