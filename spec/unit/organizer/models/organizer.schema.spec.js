'use strict';

var mongoose = require('mongoose');
var User = require('../../../../app/models/user.model');
var Organizer = require('../../../../app/models/organizer.model');

var config = require('../../../../config/config');

var user;
var organizer;

describe('Organizer Model', function(done) {

  beforeEach(function(done) {
    User.remove({}, function(err) {
      Organizer.remove({}, function(err) {
        done();
      });
    });
  });

  describe('Create organizer profile', function() {
    beforeEach(function(done) {
      user = new User();
      user.firstname = 'dame';
      user.lastname = 'matt';
      user.email = 'matt@gmail.com';
      user.password = 'mattdame';

      organizer = new Organizer();
      organizer.about = 'about';
      organizer.logo = 'logo';

      done();
    });

    it('should not accept entry without name', function(done) {

      user.save(function(err, newUser) {
        expect(err).toBe(null);

        if (!err) {

          organizer.user_ref = newUser._id;

          organizer.save(function(err) {

            expect(err).not.toBe(null);
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should not accept entry without user_ref', function(done) {

      organizer.name = 'name';

      organizer.save(function(err) {

        expect(err).not.toBe(null);
        done();
      });
    });

    it('should store organizer object when correct parameters are supplied', function(done) {

      user.save(function(err, newUser) {
        expect(err).toBe(null);

        if (!err) {

          organizer.user_ref = newUser._id;
          organizer.name = 'name';

          organizer.save(function(err, org) {

            expect(err).toBe(null);
            expect(org.user_ref).not.toBe(null);
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should not allow organizer with duplicate user_ref', function(done) {

      user.save(function(err, newUser) {
        expect(err).toBe(null);

        if (!err) {

          organizer.user_ref = newUser._id;
          organizer.name = 'name';

          var userId = newUser._id;
          organizer.save(function(err, org) {

            expect(err).toBe(null);

            if (!err) {
              expect(org.user_ref).not.toBe(null);

              organizer = new Organizer();
              organizer.user_ref = userId;
              organizer.name = 'name2';
              organizer.about = 'about';
              organizer.logo = 'logo';

              organizer.save(function(err, org1) {
                expect(err).not.toBe(null);
                done();
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      });
    });
  });
});
