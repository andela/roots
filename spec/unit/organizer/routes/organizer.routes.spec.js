'use strict';

var request = require('supertest');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');
var User = require('../../../../app/models/user.model');
var Organizer = require('../../../../app/models/organizer.model');

var config = require('../../../../config/config');

var app = express();
var router = express.Router();

var user;
var organizer;

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

require('../../../../app/routes/index')(router);

app.use(router);

describe("API Test for Organizer routes", function() {

  var userId;
  var token;

  describe("Create organizer profile", function() {

    beforeEach(function(done) {
      user = new User();

      user.firstname = 'dame';
      user.lastname = 'matt';
      user.email = 'matt@gmail.com';
      user.password = 'mattdame';
      User.remove({}, function(err) {
        Organizer.remove({}, function(err) {

          done();
        });
      });

    });

    it('should not allow new organizer profile created without token', function(done) {

      request(app)
        .post('/api/organizer')
        .set('Content-Type', 'application/json')
        .send({
          organName: 'Organ'
        })
        .expect(403)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            success: false,
            message: 'No token provided.'
          }));
        });
      done();
    });

    it('should not create a new profile without organiztion name', function(done) {

      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        request(app)
          .post('/api/organizer')
          .set('Content-Type', 'application/json')
          .send({
            token: token
          })
          .expect(403)
          .end(function(err, response) {

            expect(response.body).toEqual(jasmine.objectContaining({
              success: false,
              message: 'Check parameters!'
            }));

            done();
          });

      });
    });

    it('should create a new profile with organiztion name and token', function(done) {
      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        request(app)
          .post('/api/organizer')
          .set('Content-Type', 'application/json')
          .send({
            token: token,
            organName: 'Organizer'
          })
          .expect(200)
          .end(function(err, response) {
            expect(err).toBe(null);
            done();
          });
      });

    });

    it('should not create duplicate organizer profile', function(done) {

      user.save(function(err) {
        userId = user._id;
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        organizer = new Organizer();
        organizer.about = 'about';
        organizer.logo = 'logo';
        organizer.user_ref = userId;
        organizer.name = 'name2';

        organizer.save(function(err) {

          user.organizer_ref = organizer._id;

          user.save(function(err) {

            request(app)
              .post('/api/organizer')
              .set('Content-Type', 'application/json')
              .send({
                token: token,
                organName: 'Organizer'
              })
              .expect(422)
              .end(function(err, response) {
                expect(response.body).toEqual(jasmine.objectContaining({
                  success: false,
                  message: 'User already registered as Organizer!'
                }));
                done();
              });

          });
        });

      });
    });

    it('should modify organizer profile', function(done) {

      user.save(function(err) {
        userId = user._id;
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        organizer = new Organizer();
        organizer.about = 'about';
        organizer.logo = 'logo';
        organizer.user_ref = userId;
        organizer.name = 'name2';

        organizer.save(function(err) {

          user.organizer_ref = organizer._id;

          user.save(function(err) {

            request(app)
              .put('/api/organizer/' + organizer._id + '?token=' + token)
              .set('Content-Type', 'application/json')
              .send({
                token: token,
                newProfile: {
                  name: 'New name',
                  about: 'New about',
                  logo: 'New logo'
                }
              })
              .expect(200)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  name: 'New name',
                  about: 'New about',
                  logo: 'New logo'
                }));
                done();
              });
          });
        });

      });
    });

    it('should retrieve organizer model after creating it', function(done) {

      user.save(function(err) {
        userId = user._id;
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        organizer = new Organizer();
        organizer.about = 'about';
        organizer.logo = 'logo';
        organizer.user_ref = userId;
        organizer.name = 'name2';

        organizer.save(function(err) {

          user.organizer_ref = organizer._id;

          user.save(function(err) {

            request(app)
              .get('/api/organizer/' + organizer._id + '?token=' + token)
              .set('Content-Type', 'application/json')
              .expect(200)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  name: 'name2'
                }));
                done();
              });
          });
        });

      });
    });

    it('should retrieve all organizer models', function(done) {

      user.save(function(err) {
        userId = user._id;
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        organizer = new Organizer();
        organizer.about = 'about';
        organizer.logo = 'logo';
        organizer.user_ref = userId;
        organizer.name = 'name2';

        organizer.save(function(err) {

          user.organizer_ref = organizer._id;

          user.save(function(err) {

            request(app)
              .get('/api/organizers' + '?token=' + token)
              .set('Content-Type', 'application/json')
              .expect(200)
              .end(function(err, response) {

                expect(response.body.length).toEqual(1);
                done();
              });
          });
        });

      });
    });

  });

  describe("Modify organizer profile", function() {

    beforeEach(function(done) {
      user = new User();

      user.firstname = 'dame';
      user.lastname = 'matt';
      user.email = 'matt@gmail.com';
      user.password = 'mattdame';

      organizer = new Organizer();
      organizer.about = 'about';
      organizer.logo = 'logo';
      organizer.user_ref = userId;
      organizer.name = 'name2';

      User.remove({}, function(err) {
        Organizer.remove({}, function(err) {

          done();
        });
      });

    });

    it('should not add a team member without manager Id after creating it', function(done) {

      user.save(function(err) {
        userId = user._id;
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        organizer.user_ref = userId;
        organizer.save(function(err) {

          user.organizer_ref = organizer._id;

          user.save(function(err) {

            request(app)
              .post('/api/organizer/' + organizer._id + '/team?token=' + token)
              .set('Content-Type', 'application/json')
              .send({
                token: token,
                manager: {
                  role: 'Role1'
                }
              })
              .expect(422)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  success: false,
                  message: 'Check parameters!'
                }));

                done();
              });
          });
        });

      });
    });

    it('should not add a team member without manager Role after creating it', function(done) {

      user.save(function(err) {
        userId = user._id;
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        organizer.user_ref = userId;
        organizer.save(function(err) {

          user.organizer_ref = organizer._id;

          user.save(function(err) {

            request(app)
              .post('/api/organizer/' + organizer._id + '/team?token=' + token)
              .set('Content-Type', 'application/json')
              .send({
                token: token,
                manager: {
                  manager_ref: userId
                }
              })
              .expect(422)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  success: false,
                  message: 'Check parameters!'
                }));

                done();
              });
          });
        });

      });
    });

    it('should add a team member with correct parameters', function(done) {

      user.save(function(err) {
        userId = user._id;
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        organizer.user_ref = userId;
        organizer.save(function(err) {

          user.organizer_ref = organizer._id;

          user.save(function(err) {

            request(app)
              .post('/api/organizer/' + organizer._id + '/team?token=' + token)
              .set('Content-Type', 'application/json')
              .send({
                token: token,
                manager: {
                  manager_ref: userId,
                  role: 'Role1'
                }
              })
              .expect(200)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  manager_ref: userId.toString()
                }));

                done();
              });
          });
        });

      });
    });

    it('should edit a team member role', function(done) {

      var memberId;
      user.save(function(err) {
        userId = user._id;
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        organizer.user_ref = userId;
        organizer.save(function(err) {

          user.organizer_ref = organizer._id;

          user.save(function(err) {

            request(app)
              .post('/api/organizer/' + organizer._id + '/team?token=' + token)
              .set('Content-Type', 'application/json')
              .send({
                token: token,
                manager: {
                  manager_ref: userId,
                  role: 'Role1'
                }
              })
              .expect(200)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  manager_ref: userId.toString()
                }));
                memberId = response.body._id;

                request(app)
                  .put('/api/organizer/' + organizer._id + '/team/' + memberId + '?token=' + token)
                  .set('Content-Type', 'application/json')
                  .send({
                    token: token,
                    newRole: 'newRole'
                  })
                  .expect(200)
                  .end(function(err, response) {

                    expect(response.body).toEqual(jasmine.objectContaining({
                      success: true,
                      message: 'Role updated!'
                    }));

                    done();
                  });
              });
          });
        });

      });
    });
  });



  describe("Delete organizer profile", function() {

    beforeEach(function(done) {
      user = new User();

      user.firstname = 'dame';
      user.lastname = 'matt';
      user.email = 'matt@gmail.com';
      user.password = 'mattdame';

      organizer = new Organizer();
      organizer.about = 'about';
      organizer.logo = 'logo';
      organizer.user_ref = userId;
      organizer.name = 'name2';

      User.remove({}, function(err) {
        Organizer.remove({}, function(err) {

          done();
        });
      });

    });


    it('should delete a team member', function(done) {

      var memberId;
      user.save(function(err) {
        userId = user._id;
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        organizer.user_ref = userId;
        organizer.save(function(err) {

          user.organizer_ref = organizer._id;

          user.save(function(err) {

            request(app)
              .post('/api/organizer/' + organizer._id + '/team?token=' + token)
              .set('Content-Type', 'application/json')
              .send({
                token: token,
                manager: {
                  manager_ref: userId,
                  role: 'Role1'
                }
              })
              .expect(200)
              .end(function(err, response) {

                expect(response.body).toEqual(jasmine.objectContaining({
                  manager_ref: userId.toString()
                }));
                memberId = response.body._id;

                request(app)
                  .delete('/api/organizer/' + organizer._id + '/team/' + memberId + '?token=' + token)
                  .set('Content-Type', 'application/json')
                  .expect(200)
                  .end(function(err, response) {

                    expect(response.body).toEqual(jasmine.objectContaining({
                      success: true,
                      message: 'Record deleted!'
                    }));

                    done();
                  });
              });
          });
        });
      });
    });

  });

});
