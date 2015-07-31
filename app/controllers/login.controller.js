'use strict';
var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var config = require('../../config/database.config');
var User = require('../models/user.model');
var secretSource = require('../../config/database.config');

var LoginController = function() {};

LoginController.prototype.auth = function(req, res){
  if(!req.body.password){
    res.json({
        success: false,
        message: 'No password provided.'
    })
  } else {
    User.findOne({email: req.body.email}).select('email password').exec(function(err, user){
      if (err) throw err;

      if(!user) {
        res.json({
          success: false,
          message: 'Authentication failed. User not found.'
        });
      } else if (user) {
        var validPassword = user.comparePassword(req.body.password);
        if(!validPassword) {
          res.json({
            success: false,
            message: 'Authentication failed. Wrong password.'
          });
        } else {

          var token = jwt.sign({
            password: user.password,
            email: user.email}, secretSource.secret, {
              expiresInMinutes: 1440 //24hr expiration
          });
        }
      }
    });
  }
};

LoginController.prototype.getCurrentUser = function(req, res){
  User.findById(req.params.user_id, function(err, user) {
    if(err) res.send(err);

    res.json(user);
  }); 
};

LoginController.prototype.deleteCurrentUser = function(req, res) {
  User.remove({
    _id: req.params.user_id}, function(err, user) {
      if(err) return res.send(err);

      res.json({message: 'Succesfully deleted'});
    
  });
};

module.exports = LoginController;