'use strict';

var request = require('supertest');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var User = require('../../app/models/user.model');

var app = express();
var router = express.Router();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

require('../../app/routes/index')(router);

app.use(router);

describe("Server Test", function() {

  describe("GET /api", function() {
    it("returns status code 200", function(done) {
      request(app)
        .get("/api")
        .expect(200)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            "success": true,
            "message": "Mr API"
          }));
          done();
        });
    });
  });

   describe("User signup validation", function() {

  	it('should not create a new user if there is no firstname', function(done) {

      request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          firstname: undefined,
  	      lastname: 'loga',
          email: 'yoga@gmail.com',
          password: '1234',
          phoneNumber1: '12345',
          gender: 'male'
        })
        .expect(422)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
          	success : true,
            message: 'user created'
          }));
        });
        done();
    });

    it('should not create a new user if there is no lastname', function(done) {

      request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          firstname: 'yoga',
  	      lastname: undefined,
          email: 'yoga@gmail.com',
          password: '1234',
          phoneNumber1: '12345',
          gender: 'male'
        })
        .expect(422)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            success : true,
            message: 'user created'
          }));         
        });
        done();
    });
    
    it('should not create a new user if there is no email', function(done) {

      request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          firstname: 'yoga',
  	      lastname : 'loga',
          email: undefined,
          password: '1234',
          phoneNumber1: '12345',
          gender: 'male'
        })
        .expect(422)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            success : true,
            message: 'user created'
          }));  
        });
        done();
    });

    it('should not create a new user if there is no password', function(done) {

      request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          firstname: 'yoga',
  	      lastname: 'loga',
          email: 'yoga@gmail.com',
          password: undefined,
          phoneNumber1: '12345',
          gender: 'male'
        })
        .expect(422)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            success : true,
            message: 'user created'
          }));         
        });
        done();
    });
    
    it('should not create a new user if there is no phoneNumber1', function(done) {

      request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          firstname: 'yoga',
  	      lastname: 'loga',
          email: 'yoga@gmail.com',
          password: '****',
          phoneNumber1: undefined,
          gender: 'male'
        })
        .expect(422)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            success : true,
            message: 'user created'
          }));          
        });
        done();
    });

    it('should not create a new user if there is no gender', function(done) {

      request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          firstname: 'yoga',
  	      lastname: 'loga',
          email: 'yoga@gmail.com',
          password: '****',
          phoneNumber1: '12345',
          gender: undefined
        })
        .expect(422)
        .end(function(err, response) {

          expect(response.body).toEqual(jasmine.objectContaining({
            success : true,
            message: 'user created'
          }));          
        });
        done();
    });
  });

  describe("User signup", function() {

    beforeEach(function(done) {

      User.remove({}, function(err) {

        if (!err) {
          console.log('User collection removed!');
        }
      });
      done();
    });

    it('should create a new user', function(done) {

      request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send({
          firstname: 'yoga',
          lastname: 'loga',
          email: 'yoga@gmail.com',
          password: '1234',
          phoneNumber1: '12345',
          gender: 'male'
        })
        .expect(200)
        .end(function(err, response) {
          expect(response.body).toEqual(jasmine.objectContaining({
            type: true
          }));
          
        });
        done();
    });

    it('should not create duplicate user', function(done) {

      var user = new User();
      user.firstname = 'yoga';
      user.lastname = 'loga';
      user.email = 'yoga@gmail.com';
      user.password = '****';
      user.phoneNumber1 = '12345';
      user.gender = 'male';

      user.save(function() {
        request(app)
          .post('/api/users')
          .set('Content-Type', 'application/json')
          .send({
            email: 'yoga@gmail.com',
            password: '7777'
          })
          .expect(422)
          .end(function(err, response) {
            expect(response.body).toEqual(jasmine.objectContaining({
              data: 'User already exists!'
            }));
            
          });          
      });
      done();
    });
  });

});


