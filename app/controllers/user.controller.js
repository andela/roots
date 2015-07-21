'use strict';
var express = require('express');
var mongoose = require('mongoose');
var config = require('../../config/database.config');
var User = require('../models/user.model');
var router = require('../routes/index');


router.userSignup = function(req, res) {
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
          return res.json({success: true, text:'user created'});
        });
      }
  });
}

router.getUsers = function(req, res) {
  User.find(function(err, users) {
    if (err) {
      return res.json(err);
    }
    return res.json(users);
  });
};

router.deleteAll = function(req, res) {
  User.remove(function(err, users) {
    if (err) {
      return res.json(err);
    }
    router.getUsers(req, res);
  });
};
module.exports = router;