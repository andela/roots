'use strict';

var request = require('supertest');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');
var User = require('../../../../app/models/user.model');
var Event = require('../../../../app/models/event.model');

var config = require('../../../../config/config');

var app = express();
var router = express.Router();

var user;
var evt;
var token;

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

require('../../../../app/routes/index')(router);

app.use(router);

describe("API Test for Event routes", function() {

  describe("Create event", function() {

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

      User.remove({}, function(err) {
        Event.remove({}, function(err) {

          done();
        });
      });

    });

    it('should not allow new event created without token', function(done) {

      request(app)
        .post('/api/event')
        .set('Content-Type', 'application/json')
        .send({
          eventObj: evt
        })
        .expect(403)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            success: false,
            message: 'No token provided.'
          }));
          done();
        });
    });

    it('should not allow new event created with invalid token', function(done) {

      request(app)
        .post('/api/event')
        .set('Content-Type', 'application/json')
        .send({
          token: 'token',
          eventObj: evt
        })
        .expect(403)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            success: false,
            message: 'Failed to authenticate token.'
          }));
          done();
        });
    });

    it('should not allow new event created without event name', function(done) {

      evt.name = undefined;
      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        request(app)
          .post('/api/event')
          .set('Content-Type', 'application/json')
          .send({
            token: token,
            eventObj: evt
          })
          .expect(200)
          .end(function(err, response) {
            expect(err).not.toBeNull();
            done();
          });
      });
    });

    it('should not allow new event created without start date', function(done) {

      evt.startDate = undefined;
      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        request(app)
          .post('/api/event')
          .set('Content-Type', 'application/json')
          .send({
            token: token,
            eventObj: evt
          })
          .expect(200)
          .end(function(err, response) {
            expect(err).not.toBeNull();
            done();
          });
      });
    });

    it('should not allow new event created without end date', function(done) {

      evt.endDate = undefined;
      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        request(app)
          .post('/api/event')
          .set('Content-Type', 'application/json')
          .send({
            token: token,
            eventObj: evt
          })
          .expect(200)
          .end(function(err, response) {
            expect(err).not.toBeNull();
            done();
          });
      });
    });

    it('should create event with all required parameters', function(done) {

      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        request(app)
          .post('/api/event')
          .set('Content-Type', 'application/json')
          .send({
            token: token,
            eventObj: evt
          })
          .expect(200)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              name: 'Event name'
            }));
            done();
          });
      });
    });
  });

  describe('Edit event', function() {

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

      User.remove({}, function(err) {
        Event.remove({}, function(err) {

          done();
        });
      });
    });

    it('should not edit event without token', function(done) {

      user.save(function(err) {

        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            request(app)
              .put('/api/event/' + evt._id)
              .set('Content-Type', 'application/json')
              .send({

                eventObj: evt
              })
              .expect(403)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  success: false,
                  message: 'No token provided.'
                }));
                done();
              });
          });
        } else {
          done();
        }
      });
    });

    it('should not edit event with an invalid event id', function(done) {

      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            request(app)
              .put('/api/event/1a1a1a1a1a1a1a1a1a1a1a1a' + '?token=' + token)
              .set('Content-Type', 'application/json')
              .send({
                token: token,
                eventObj: evt
              })
              .expect(422)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  success: false,
                  message: 'Event not found!'
                }));
                done();
              });
          });
        } else {
          done();
        }
      });
    });

    it('should not edit event created by another user', function(done) {

      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        expect(err).toBe(null);

        if (!err) {


          var user2 = new User();
          user2.firstname = 'dame2';
          user2.lastname = 'matt2';
          user2.email = 'matt2@gmail.com';
          user2.password = 'mattdame2';

          user2.save(function(err) {

            expect(err).toBe(null);

            if (!err) {

              evt.user_ref = user2._id;

              evt.save(function(err) {

                expect(err).toBe(null);
                request(app)
                  .put('/api/event/' + evt._id + '?token=' + token)
                  .set('Content-Type', 'application/json')
                  .send({
                    token: token,
                    eventObj: evt
                  })
                  .expect(403)
                  .end(function(err, response) {

                    expect(response.body).toEqual(jasmine.objectContaining({
                      success: false,
                      message: 'Unauthorized!'
                    }));
                    done();
                  });
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

    it('should edit event', function(done) {

      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);

            var editedEvent = new Event();
            editedEvent.name = 'Edited name';
            editedEvent.description = 'Edited description';
            editedEvent.category = 'Edited category';

            editedEvent.venue = {
              address: 'Edited address'
            };
            editedEvent.startDate = '2014-08-23T18:30:00.000Z';
            editedEvent.endDate = '2016-08-30T18:25:43.511Z';
            editedEvent.eventUrl = 'www.event.com';

            request(app)
              .put('/api/event/' + evt._id + '?token=' + token)
              .set('Content-Type', 'application/json')
              .send({
                token: token,
                eventObj: editedEvent
              })
              .expect(422)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  name: 'Edited name',
                  description: 'Edited description',
                  category: 'Edited category',
                  venue: {
                    address: 'Edited address'
                  },
                  startDate: '2014-08-23T18:30:00.000Z',
                  endDate: '2016-08-30T18:25:43.511Z'
                }));
                done();
              });
          });
        } else {
          done();
        }
      });
    });

  });

  describe('Delete event', function() {

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

      User.remove({}, function(err) {
        Event.remove({}, function(err) {

          done();
        });
      });
    });

    it('should not delete event without token', function(done) {

      user.save(function(err) {

        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            request(app)
              .delete('/api/event/' + evt._id)
              .set('Content-Type', 'application/json')
              .expect(403)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  success: false,
                  message: 'No token provided.'
                }));
                done();
              });
          });
        } else {
          done();
        }
      });
    });

    it('should not delete event created by another user', function(done) {

      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        expect(err).toBe(null);

        if (!err) {

          var user2 = new User();
          user2.firstname = 'dame2';
          user2.lastname = 'matt2';
          user2.email = 'matt2@gmail.com';
          user2.password = 'mattdame2';

          user2.save(function(err) {

            expect(err).toBe(null);

            if (!err) {

              evt.user_ref = user2._id;

              evt.save(function(err) {

                expect(err).toBe(null);
                request(app)
                  .delete('/api/event/' + evt._id + '?token=' + token)
                  .set('Content-Type', 'application/json')
                  .expect(403)
                  .end(function(err, response) {

                    expect(response.body).toEqual(jasmine.objectContaining({
                      success: false,
                      message: 'Unauthorized!'
                    }));
                    done();
                  });
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

    it('should delete event', function(done) {

      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            request(app)
              .delete('/api/event/' + evt._id + '?token=' + token)
              .set('Content-Type', 'application/json')
              .expect(200)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  message: 'Succesfully deleted'
                }));
                done();
              });
          });
        } else {
          done();
        }
      });
    });
  });

  describe('Get event', function() {

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

      User.remove({}, function(err) {
        Event.remove({}, function(err) {

          done();
        });
      });
    });

    it('should get event', function(done) {

      user.save(function(err) {

        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            request(app)
              .get('/api/event/' + evt._id)
              .set('Content-Type', 'application/json')
              .expect(200)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  name: 'Event name',
                  startDate: '2015-08-23T18:30:00.000Z'
                }));
                done();
              });
          });
        } else {
          done();
        }
      });
    });

    it('should get all events', function(done) {

      user.save(function(err) {

        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);


            var eventTwo = new Event();
            eventTwo.name = 'Edited name';
            eventTwo.description = 'Edited description';
            eventTwo.category = 'Edited category';

            eventTwo.venue = {
              address: 'Edited address'
            };
            eventTwo.startDate = '2014-08-23T18:30:00.000Z';
            eventTwo.endDate = '2016-08-30T18:25:43.511Z';
            eventTwo.eventUrl = 'www.event2.com';

            eventTwo.user_ref = user._id;

            eventTwo.save(function(err2) {
              expect(err2).toBe(null);

              if (!err2) {

                request(app)
                  .get('/api/events')
                  .set('Content-Type', 'application/json')
                  .expect(200)
                  .end(function(err, response) {

                    expect(response.body.length).toEqual(2);
                    done();
                  });
              } else {
                done();
              }
            });
          });
        } else {
          done();
        }
      });
    });

  });

});
