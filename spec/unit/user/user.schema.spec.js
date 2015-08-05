'use strict';
var mongoose = require('mongoose');
require('../../../app/models/user.model');
var User = mongoose.model('User');
var user;
var config = require('../../../config/config');
mongoose.connect(config.db)

describe('User Model', function(done) {

   beforeEach(function(done) {
      User.remove({}, function(err) {
        if(err) {
          console.log(err)
        }
        else {
          console.log('user removed')
        }
      })
      done();
    });

  describe('Sign up', function() {
    beforeEach(function(done){
      user = new User();
      done();
    });

    it('should not accept entry without firstname', function(done) {
      user.firstname = '';
      user.lastname = 'Matt';
      user.email = 'matt@gmail.com';
      user.password = 'mattdame';
      user.save(function(err) {
        expect(err).not.toBe(null);
        done();
      });
    });

    it('should not accept entry without lastname', function(done) {
      user.firstname = 'dame';
      user.lastname = '';
      user.email = 'matt@gmail.com';
      user.password = 'mattdame';
      user.save(function(err) {
        expect(err).not.toBe(null);
        done();
      });
    });

    it('should not accept entry without email', function(done) {
      user.firstname = 'dame';
      user.lastname = 'matt';
      user.email = '';
      user.password = 'mattdame';
      user.save(function(err) {
        expect(err).not.toBe(null);
        done();
      });
    });

    it('should not accept entry without password', function(done) {
      user.firstname = 'dame';
      user.lastname = 'matt';
      user.email = 'matt@gmail.com';
      user.password = '';
      user.save(function(err) {
        expect(err).not.toBe(null);
        done();
      });
    });

    it('should accept entry when above fields are completed', function(done) {
      user.firstname = 'dame';
      user.lastname = 'matt';
      user.email = 'matt@gmail.com';
      user.password = 'mattdame';
      user.save(function(err) {
        expect(err).toBe(null);
        done();
      });
    });

  });
});