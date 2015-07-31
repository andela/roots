'use strict';
var express = require('express');
var mongoose = require('mongoose');
var config = require('../../config/database.config');
var User = require('../models/user.model');
var jwt = require('jsonwebtoken');
var secretSource = require('../../config/database.config');

var UserController = function() {};

UserController.prototype.userSignup = function (req, res) {

  if(!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.password){
      return res.status(422).send({ 
        success : false, 
        message : 'Check parameters!'
      });
  }

  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      return res.json(err);
    }
    else if (user) {
      res.json({
        success: false,
        message: 'user email taken'
      });
    } else {
        User.create(req.body, function(err, user) {
          if (err) {
            return res.json(err);
          }
          return res.json(user);
        });
      }
  });
};

UserController.prototype.authenticate = function(req, res) {
  
    User.findOne({email: req.body.email}).exec(function(err, user){
      if (err) throw err;

      if(!user) {
        res.json({
          success: false,
          message: 'Authentication failed. User not found.'
        });
      } else {
        var validPassword = user.comparePassword(req.body.password);
        if(!validPassword) {
          res.json({
            success: false,
            message: 'Authentication failed. Wrong password.'
          });
        } else {

          var token = jwt.sign(user, secretSource.secret, {
              expiresInMinutes: 1440 //24hr expiration
          });

          //return info including token in JSON format
          res.json({
            user: user,
            success: true,
            message: 'Enjoy your token',
            token: token
          });
        }
      }
    });
};

UserController.prototype.getUsers = function(req, res) {
  User.find(function(err, users) {
    if (err) {
      return res.json(err);
    }
    return res.json(users);
  });
};

UserController.prototype.deleteAll = function(req, res) {
  User.remove(function(err, users) {
    if (err) {
      return res.json(err);
    }
    UserController.prototype.getUsers(req, res);
  });
};

module.exports = UserController;