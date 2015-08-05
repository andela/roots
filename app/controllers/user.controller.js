'use strict';
var express = require('express');
var mongoose = require('mongoose');
var config = require('../../config/config');
var User = require('../models/user.model');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

var UserController = function() {};

UserController.prototype.welcomeMail = function(req, res) {
  var transporter = nodemailer.createTransport();
  var data = req.body;
  var mailOptions = {
    from: 'World tree ✔ <no-reply@worldtreeinc.com>',
    to: data.mail,
    subject: 'Welcome to World Tree!',
    text: 'Welcome to World Tree!',
    html: '<div style="background:#00b2ee;height:400px;">'+
    '<h1 style="margin:0 auto;color:white"> Hello ' + data.name + '</h1<br><br>' +
    '<h3 style="margin:0 auto;color:white">Organize Events Efficiently. Better Planning. Faster Team Work :)<br> Get the best with world tree event manager</h3>' +
    '</div>'
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if(error) {
      console.log(error);
    }
    else {
      console.log('message sent: ' + info);
    }
  });
};

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
      } 
      else if (req.body.password) {
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
      else {
        return;
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