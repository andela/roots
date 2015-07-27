'use strict';
var express = require('express');
var mongoose = require('mongoose');
var config = require('../../config/database.config');
var User = require('../models/user.model');
// var router = express.Router();

var UserController = function() {

};

UserController.prototype.userSignup = function (req, res) {
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      return res.json(err);
    }
    else if (user) {
      res.json({
        sucess: false,
        message: 'user email taken'
      });
    } else {
        User.create(req.body, function(err, user) {
          if (err) {
            return res.json(err);
          }
          return res.json({success: true, message:'user created'});
        });
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