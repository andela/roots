'use strict';
//var express = require('express');
//var mongoose = require('mongoose');
var verifyToken = require('../../config/tokenMiddleware');
var User = require('../models/user.model');
//var router = require('../routes/index');
var jwt = require('jsonwebtoken');
var secret = 'swift';

module.exports = {
  auth: function(req, res){
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
              email: user.email}, secret, {
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
  },

  //get specific user info
  currentUser: function(req, res){
    User.findById(req.params.user_id, function(err, user) {
      if(err) res.send(err);

      res.json(user);
    }); 
  },
    

  deleteUser: function(req, res) {
    User.remove({
      _id: req.params.user_id}, function(err, user) {
        if(err) return res.send(err);

        res.json({message: 'Succesfully deleted'});
      
    });
  }

    // apiRouter.get('/me', function(req, res) {
    //   res.send(req.decoded);
    // });
}
//module.exports = router;