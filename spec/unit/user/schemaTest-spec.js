'use strict';

var mongoose = require('mongoose');
var config = require('../../../config/database.config');
// mongoose.connect(config[process.env.NODE_ENV]);

var UserModel = require('../../../app/models/user.model');
var user;

describe('User Model', function(done){
  beforeEach(function(done){
    user = new UserModel();
    done();
  });
});