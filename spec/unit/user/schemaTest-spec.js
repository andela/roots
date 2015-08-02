'use strict';

var config = require('../../../config/config');

var UserModel = require('../../../app/models/user.model');
var user;

describe('User Model', function(done){
  beforeEach(function(done){
    user = new UserModel();
    done();
  });
});
