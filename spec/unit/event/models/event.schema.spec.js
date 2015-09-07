'use strict';

var mongoose = require('mongoose');
var User = require('../../../../app/models/user.model');
var Event = require('../../../../app/models/event.model');

var config = require('../../../../config/config');

var user;
var evt;

describe('Event Model', function(done) {

  beforeEach(function(done) {
    User.remove({}, function(err) {
      Event.remove({}, function(err) {
        done();
      });
    });
  });

  describe('Create event', function() {
    beforeEach(function(done) {
      user = new User();
      user.firstname = 'dame';
      user.lastname = 'matt';
      user.email = 'matt@gmail.com';
      user.password = 'mattdame';

      evt = new Event();
      evt.name = 'Event name';
      evt.category = 'Event category';
      evt.description = 'description';
      evt.venue = {
        address: 'address'
      };
      evt.startDate = '2015-08-23T18:30:00.000Z';
      evt.endDate = '2015-08-30T18:25:43.511Z';
      evt.eventUrl = 'www.event.com';

      done();
    });

    it('should not accept entry without user_ref', function(done) {    

      evt.save(function(err) {

        expect(err).not.toBe(null);
        done();
      });

    });

    it('should not accept entry without event name', function(done) {

      evt.name = undefined;

      user.save(function(err) {
        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).not.toBe(null);
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should not accept entry without event category', function(done) {

      evt.category = undefined;
      
      user.save(function(err) {
        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).not.toBe(null);
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should not accept entry without event description', function(done) {

      evt.description = undefined;
      
      user.save(function(err) {
        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).not.toBe(null);
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should not accept entry without event address', function(done) {

      evt.venue.address = undefined;
      
      user.save(function(err) {
        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).not.toBe(null);
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should not accept entry without event start date', function(done) {

      evt.startDate = undefined;
      
      user.save(function(err) {
        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).not.toBe(null);
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should not accept entry without event end date', function(done) {

      evt.endDate = undefined;
      
      user.save(function(err) {
        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).not.toBe(null);
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should create event with all required parameters', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            expect(evt._id).toBeDefined();
            done();
          });
        } else {
          done();
        }
      });
    });
  });
});
