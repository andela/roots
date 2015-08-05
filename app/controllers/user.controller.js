'use strict';
var express = require('express');
var mongoose = require('mongoose');
var config = require('../../config/config');
var User = require('../models/user.model');
var jwt = require('jsonwebtoken');

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
    if (user) {
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

UserController.prototype.decodeUser = function(req, res) {
  return res.json(req.decoded);
};

UserController.prototype.verifyToken = function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        //if all checks are passed, save decoded info to request
        req.decoded = decoded;
        next();
      }
    });
  }
  else {
    //show http 403 message when token is not provided
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });

  }
};

UserController.prototype.authenticate = function(req, res) {
    User.findOne({email: req.body.email}).exec(function(err, user){
      if (err) 
        return res.json(err);

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
        } 
        else {
          var token = jwt.sign(user, config.secret, {
              expiresInMinutes: 1440 //24hr expiration
          });
          //return info including token in JSON format
          res.json({
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

UserController.prototype.editUser = function(req, res) {
  User.update({
    _id: req.params.user_id
  }, req.body, function(err, user) {
    if (err) {
      return res.json(err);
    }
    User.findById(req.params.user_id, function(err, user) {
    if(err) {
      res.send(err);
    }
    res.json(user);
    }); 
  });
};

UserController.prototype.getCurrentUser = function(req, res){
  User.findById(req.params.user_id, function(err, user) {
    if(err) {
      res.send(err);
    }
    res.json(user);
  }); 
};

UserController.prototype.deleteCurrentUser = function(req, res) {
  User.remove({
    _id: req.params.user_id}, function(err, user) {
      if(err) return res.send(err);

      res.json({message: 'Succesfully deleted'});
    
  });
};

module.exports = UserController;