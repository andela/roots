'use strict';

require('../models/user.model');
var express = require('express');
var mongoose = require('mongoose');
var config = require('../../config/database.config');
var User = mongoose.model('User');


exports.userSignup = function(req, res) {
	User.findOne({
    	email: req.body.email
  	}, function(err, user) {
    	if (user) {
      		res.json({
        		sucess: false,
        		message: 'user email taken'
      		});
    	} else {
      		User.create(req.body, function(err, user) {
        		if (err) {
          			return res.json(err);
        		}
        		return res.json({success: true, text:'user created'});
      		});
    	  }
  		});
}

exports.getUsers = function(req, res) {
  User.find(function(err, users) {
    if (err) {
      return res.json(err);
    }
    return res.json(users);
  });
};

exports.deleteAll = function(req, res) {
  User.remove(function(err, users) {
    if (err) {
      return res.json(err);
    }
    exports.getUsers(req, res);
  });
};