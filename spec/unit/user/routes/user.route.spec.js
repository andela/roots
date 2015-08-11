'use strict';

var request = require('supertest');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var User = require('../../../app/models/user.model');

var app = express();
var router = express.Router();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

require('../../../app/routes/index')(router);

app.use(router);

describe("API Test", function() {

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
            success : false,
            message: 'Check parameters!'
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
            success : false,
            message: 'Check parameters!'
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
            success : false,
            message: 'Check parameters!'
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
            success : false,
            message: 'Check parameters!'
          }));         
        });
        done();
    });
    
    
  });

  describe("User signup", function() {

    User.remove({}, function(err) {
      if (!err) {
        console.log('User collection removed!');
      }
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
          expect(err).toBe(null);
        });
        done();
    });

    it('should not create duplicate user', function(done) {
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
        .expect(422)
        .end(function(err, response) {
          expect(err).not.toBe(null);
        });          
      done();
    });

  });
});



