'use strict';

var mongoose = require('mongoose');
var config = require('../../../config/database.config');
// mongoose.connect(config[process.env.NODE_ENV]);

var userModel = require('../../../app/models/user.model');
var user;

describe('User Model', function(done){
  beforeEach(function(done){
    user = new userModel();
    done();
  });

  /*it('should not register invalid entry', function(done){
    user.firstname = '';
    user.lastname = '';
    user.email = '';
    user.password = '';
    user.save(function(err){
      expect(err).not.toBe(null);
      done();
    });
  });

  it('should accept valid entry', function(done){
    user.firstname = 'adam';
    user.lastname = 'johnson';
    user.email = 'adj@yahoo.com';
    user.password = 'passcode';
    user.save(function(err){
      expect(err).toBe(null);
      done();
    });
  });*/

});


