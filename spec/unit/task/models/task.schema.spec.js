'use strict';

var mongoose = require('mongoose');
var User = require('../../../../app/models/user.model');
var Event = require('../../../../app/models/event.model');
var Task = require('../../../../app/models/task.model');

var config = require('../../../../config/config');

var user;
var evt;
var task;

describe('Task Model', function(done) {

  beforeEach(function(done) {
    User.remove({}, function(err) {
      Event.remove({}, function(err) {
        Task.remove({}, function(err) {
          done();
        });
      });
    });
  });

  describe('Create task', function() {
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

      task = new Task();
      task.description = 'Task 1';
      task.startDate = '2015-08-23T18:30:00.000Z';
      task.endDate = '2015-08-23T19:25:43.511Z';

      done();
    });

    it('should not accept entry without manager_ref', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);

            if (!err) {

              task.event_ref = evt._id;

              task.save(function(err) {

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
      })
    });

    it('should not accept entry without event_ref', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);

        if (!err) {

          task.user_ref = user._id;

          task.save(function(err) {

            expect(err).not.toBe(null);
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should create task', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);
                expect(task._id).toBeDefined();
                done();
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });
  });
});
