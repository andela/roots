'use strict';
var express = require('express');
var mongoose = require('mongoose');
var config = require('../../config/config');
var User = require('../models/user.model');
var Organizer = require('../models/organizer.model');
var Volunteer = require('../models/volunteer.model');
var Task = require('../models/task.model');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var crypto = require('crypto');


var UserController = function(passport) {
  UserController.passport = passport;
};

UserController.prototype.welcomeMail = function(req, res) {
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'worldtree.noreply@gmail.com',
      pass: 'rootsdevelopers'
    }
  });
  var data = req.body;
  var mailOptions = {
    from: 'World tree ✔ <no-reply@worldtreeinc.com>',
    to: data.email,
    subject: 'Welcome to World Tree!',
    text: 'Welcome to World Tree!',
    html: '<b> Hello ' + data.firstname + ',\n Thanks for registering with World Tree. \n' +
      'Click <a href="http://roots-event-manager.herokuapp.com"> here</a> to create or view events</b>'
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('message sent: ' + info);
    }
  });
};

UserController.prototype.userSignup = function(req, res) {
  if (!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.password) {
    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }
  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) {
      return res.json(err);
    } else if (user) {
      res.json({
        success: false,
        message: 'user email taken'
      });
    } else {
      User.create(req.body, function(err, user) {
        if (err) {
          return res.json(err);
        }
        UserController.prototype.welcomeMail(req, res);
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
  } else {
    //show http 403 message when token is not provided
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });

  }
};

UserController.prototype.authenticate = function(req, res) {
  User.findOne({
    email: req.body.email
  }).exec(function(err, user) {
    if (err)
      return res.json(err);

    if (!user) {
      res.json({
        success: false,
        message: 'Authentication failed. User not found.'
      });
    } else if (req.body.password) {
      var validPassword = user.comparePassword(req.body.password);
      if (!validPassword) {
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password.'
        });
      } else {
        var token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });
        //return info including token in JSON format
        return res.json({
          success: true,
          message: 'Enjoy your token',
          token: token
        });
      }
    } else {
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

  User.findByIdAndUpdate({
    _id: req.decoded._id
  }, req.body, {
    new: true
  }, function(err, user) {
    if (err) {
      return res.json(err);
    }
    res.json(user);
  });
};

UserController.prototype.uploadPicture = function(req, res) {

  var result = req.body.dataObject;
  if (result && result.imageUrl) {

    User.findByIdAndUpdate(req.decoded._id, {
      $set: {
        profilePic: result.imageUrl
      }
    }, function(err, user) {

      if (err) {
        return res.json(err);
      } else {
        return res.json(result);
      }
    });

  } else {

    return res.status(422).json({
      success: false,
      message: 'Unable to upload image.'
    });
  }
};

UserController.prototype.editTwitUser = function(req, res) {
  req.body.mailChanged = true;
  User.update({
    _id: req.params.user_id
  }, req.body, function(err, user) {
    if (err) {
      return res.json(err);
    }
    User.findById(req.params.user_id, function(err, user) {
      if (err) {
        res.json(err);
      }
      var token = jwt.sign(user, config.secret, {
        expiresInMinutes: 1440 //24hr expiration
      });
      res.json({
        token: token
      });
    });
  });
};

UserController.prototype.getCurrentUser = function(req, res) {
  User.findById(req.decoded._id, function(err, user) {
    if (err) {
      res.status(500).send(err);
    }

    if (user.organizer_ref) {

      Organizer.populate(user, {
        'path': 'organizer_ref'
      }, function(err, user2) {

        if (err) {
          return res.json(err);
        }
        res.json(user2);
      });
    } else {
      res.json(user);
    }
  });
};

UserController.prototype.deleteCurrentUser = function(req, res) {

  var userId = req.decoded._id;

  User.findById(userId, function(err, user) {

    if (err) {
      return res.status(500).send(err);
    } else if (user) {

      if (user.organizer_ref) {

        Organizer.remove({
          user_ref: userId
        }, function(err) {
          if (err) {

            return res.status(422).send({
              success: false,
              message: 'Unable to delete user organizer profile.'
            });
          } else {

            //Remove volunteer ref from the task model
            Task.update({
              'volunteers.user_ref': userId
            }, {
              $pull: {
                volunteers: {
                  user_ref: userId
                }
              }
            }, function(err) {

              //Delete volunteer object
              Volunteer.remove({
                user_ref: userId
              }, function(err) {

                Organizer.update({
                  'staff.manager_ref': userId
                }, {
                  $pull: {
                    'staff': {
                      manager_ref: userId
                    }
                  }
                }, function(err) {
                  if (err) {

                    return res.status(422).send({
                      success: false,
                      message: 'Unable to delete user from other organizer profile.'
                    });
                  }

                  User.remove({
                    _id: userId
                  }, function(err, user) {
                    if (err) return res.status(500).send(err);

                    res.json({
                      message: 'Succesfully deleted'
                    });

                  });
                });
              });
            });
          }
        });
      }
    } else {

      return res.status(422).send({
        success: false,
        message: 'User not found in db'
      });
    }
  });
};

UserController.prototype.forgotPass = function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({
        email: req.body.email
      }, function(err, user) {
        if (!user) {
          return res.json({
            message: 'No user found'
          });
        } else {
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          user.save(function(err) {
            done(err, token, user);
          });
        }
      });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'worldtree.noreply@gmail.com',
          pass: 'rootsdevelopers'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'World tree ✔ <no-reply@worldtreeinc.com>',
        subject: 'Account Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' + '\n\n' + 'https://roots-event-manager.herokuapp.com/#/passwordreset/' + token + '\n\n' +
          ' If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err, res) {
        if (err) {
          console.log(err);
        }
        done(err);
        return res;
      });
    }
  ], function(err) {
    if (err) {
      return next(err);
    }
    res.json({
      message: 'Message Sent!'
    });
  });
};


UserController.prototype.resetPass = function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function(err, user) {
        if (!user) {
          return res.json({
            'message': 'User does not exist'
          });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err, result) {
          if (err) {
            return res.json(err);
          }
          res.json(result);
        });
      });
    },
    function(user, done) {
      var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'worldtree.noreply@gmail.com',
          pass: 'rootsdevelopers'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'World tree ✔ <no-reply@worldtreeinc.com>',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        if (err) {
          console.log(err);
        }
        done(err);
      });
    }
  ], function(err) {
    if (err) return err;
    res.json({
      message: 'Password changed!'
    });
  });
};

module.exports = UserController;
