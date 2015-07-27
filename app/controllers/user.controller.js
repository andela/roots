'use strict';
var User = require('../models/user.model');

module.exports = {
  createUser: function(req, res) {
    console.log(req.body);
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
  },

  getUsers: function(req, res) {
    User.find(function(err, users) {
      if (err) {
        return res.json(err);
      }
      return res.json(users);
    });
  },

  deleteAll: function(req, res) {
    User.remove(function(err, users) {
      if (err) {
        return res.json(err);
      }
      User.find(function(err, users) {
        if (err) {
          return res.json(err);
        }
        return res.json(users);
      });
    });
  }
}