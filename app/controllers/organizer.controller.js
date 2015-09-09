'use strict';

var User = require('../models/user.model');
var async = require('async');
var Utils = require('../middleware/utils');
var mongoose = require('mongoose');
require('../models/organizer.model');

var Organizer = mongoose.model('Organizer');


var utils = new Utils();

var OrganizerController = function() {};

OrganizerController.prototype.registerProfile = function(req, res) {
  var organizer = new Organizer(req.body);
  organizer.save(req.body, function(err, organizer){
    if(err) {
      return res.json(err);
    }
    return res.json(organizer);
  });
};

OrganizerController.prototype.createProfile = function(req, res) {

  if (!req.body.email || !req.body.organName) {
    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  } else {

    User.findOne({
      email: req.body.email
    }, function(err, user) {
      if (err) {
        return res.json(err);
      } else if (user) {

        if (user.organizer_ref) {

          return res.status(422).send({
            success: false,
            message: 'User already registered as Organizer!'
          });

        }

        var newOrgProfile = new Organizer();
        newOrgProfile.user_ref = user._id;
        newOrgProfile.name = req.body.organName;
        var newStaff = req.body.staff;
        var validatedStaff = [];


        newOrgProfile.save(function(err, orgProfile) {

          if (err) {
            if (err.code == 11000)
              return res.status(422).send({
                success: false,
                message: 'Organizer name taken!'
              });
            return res.json(err);
          }

          //Link user profile to the newly created organizer profile
          user.organizer_ref = orgProfile._id;
          user.save(function(err, updatedUser) {

            if (err) {
              return res.status(422).send({
                success: false,
                message: 'Organizer profile created, but unable to update the user organizer_ref'
              });
            }

            async.waterfall([function(done) {

              OrganizerController.prototype.addTeamMembersStub(orgProfile, newStaff, {
                sendMail: true,
                exclude: []
              }, done);

            }], function(err, returnedProfile) {

              if (err || !returnedProfile)
                returnedProfile = orgProfile;
              OrganizerController.prototype.getProfileStub(returnedProfile._id, res);
            });
          });
        });
      } else {
        return res.status(422).send({
          success: false,
          message: 'User not found!'
        });
      }
    });
  }
}

OrganizerController.prototype.editProfile = function(req, res) {

  if (!req.body.newProfile) {
    return res.status(422).send({
      success: false,
      message: 'Please check parameters!'
    });
  }

  var newStaff = req.body.newProfile.staff;

  var newProfile = req.body.newProfile;
  newProfile.staff = [];
  var oldProfile;
  var oldStaff;

  Organizer.findById(req.params.organizer_id, function(err, profile) {

    if (err) {
      return res.send(err);
    } else if (!profile) {

      return res.status(422).send({
        success: false,
        message: 'Invalid organizer id'
      });

    } else if (profile.user_ref != req.decoded._id) {

      return res.status(401).send({
        success: false,
        message: 'Unauthorized!'
      });

    } else {
      oldProfile = profile;
      oldStaff = oldProfile.staff;

      Organizer.findByIdAndUpdate(req.params.organizer_id, newProfile, {
        'new': true
      }, function(err, organizer) {
        if (err) {
          return res.json(err);
        }

        async.waterfall([function(done) {

            OrganizerController.prototype.addTeamMembersStub(organizer, newStaff, {
              sendMail: true,
              exclude: []
            }, done);

          },
          function(returnedProfile, done) {

            if (!returnedProfile) {
              Organizer.findByIdAndUpdate(oldProfile._id, {
                $set: {
                  staff: oldStaff
                }
              }, function(err, rolledBackProfile) {
                done(oldProfile);
              });

            } else {
              done(null, returnedProfile);
            }

          }
        ], function(err, returnedProfile) {

          if (err || !returnedProfile)
            returnedProfile = oldProfile;
          OrganizerController.prototype.getProfileStub(returnedProfile._id, res);
        });
      });
    }
  async.waterfall([

    function(done) {

      Organizer.findOne({
        _id: req.params.organizer_id
      }, function(err, org) {

        if (err) {
          return res.send(err);
        } else if (!org) {
          return res.status(422).send({
            success: false,
            message: 'Invalid organizer id'
          });
        } else if (org.user_ref) {

          Organizer.populate(org, {
            path: 'user_ref'
          }, function(err1, org1) {

            if (err) {
              done(null, org);
            } else {
              done(null, org1);
            }
          });



        } else {
          done(null, org);
        }

      });
    },
    function(org, done) {

      if (org.staff.length) {

        Organizer.populate(org, {
          path: 'manager_ref'
        }, function(err1, org1) {

          if (err) {
            done(null, org);
          } else {
            done(null, org1);
          }

        });
      } else {
        done(null, org);
      }
    }

  ], function(err, org) {

    if (err)
      return res.send(err);

    res.json(org);

  });
}

OrganizerController.prototype.getProfile = function(req, res) {

  this.getProfileStub(req.params.organizer_id, res);
}

OrganizerController.prototype.addTeamMembers = function(req, res) {

  if (!req.body.userId || !req.body.newStaff) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }

  Organizer.findOne({
    user_ref: req.body.userId
  }, function(err, orgProfile) {

    if (err) {
      return res.send(err);
    } else if (!orgProfile) {

      return res.status(422).send({
        success: false,
        message: 'Profile not found'
      });
    }
    var excludeStaff = JSON.parse(JSON.stringify(orgProfile.staff));

    async.waterfall([function(done) {

      OrganizerController.prototype.addTeamMembersStub(orgProfile, req.body.newStaff, {
        sendMail: true,
        exclude: excludeStaff
      }, done);

    }], function(err, returnedProfile) {

      if (err || !returnedProfile)
        returnedProfile = orgProfile;
      OrganizerController.prototype.getProfileStub(returnedProfile._id, res);
    });

  });
}


OrganizerController.prototype.getAllProfiles = function(req, res) {

  Organizer.find(function(err, organizers) {
    if (err) {
      return res.json(err);
    }
    Organizer.populate(organizers, {
      path: 'user_ref staff.manager_ref'
    }, function(err, populatedProfiles) {

      if (err) {
        return res.json(err);
      }

      res.json(populatedProfile);

    });
  });

}

OrganizerController.prototype.addTeamMembersStub = function(orgProfile, newStaff, sendMail, res, callback) {

  async.waterfall([

    function(done) {

      var validatedStaff = [];


      utils.syncLoop(newStaff.length, function(loop, processedStaff) {

        User.findById(newStaff[loop.iteration()].manager_ref, function(err, personData) {

          if (personData) {

            Organizer.findOne({
              _id: orgProfile._id,
              'staff.manager_ref': personData._id
            }, function(err, duplicate) {

              if (!err && !duplicate) {
                processedStaff.push({
                  manager_ref: personData._id,
                  role: newStaff[loop.iteration()].role
                });

                loop.next();

              } else {

                Organizer.update({
                  'staff.manager_ref': personData._id
                }, {
                  $set: {
                    'staff.role': newStaff[loop.iteration()].role
                  }
                }, function(err) {

                  loop.next();
                });
              }

            });
          } else {
            loop.next();
          }
        });

      }, function(processedStaff) {

        done(null, processedStaff);
      }, validatedStaff);

    },
    function(addedStaff, done) {

      if (!addedStaff.length) {
        done(null, orgProfile);
      } else {

        //Add validated users as staff

        addedStaff.forEach(function(eachStaff) {

          orgProfile.staff.push(eachStaff);

        });

        orgProfile.save(function(err, saved) {
          if (err) {
            done(null, orgProfile);
          } else if (!sendMail) {

            done(null, saved);
          } else {

            //Send notification mail to all added staff
            Organizer.findOne({
              _id: orgProfile._id
            }).populate('staff.manager_ref').exec(function(err, populatedProfile) {

              if (err)
                return null;

              var mailOptions = {
                to: '',
                from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                subject: populatedProfile.name + ' added you',
                text: populatedProfile.name + ' added you',
                html: 'Hello,\n\n' +
                  'You have been added as staff to <b>' + populatedProfile.name + '</b> event manager.\n'
              };


              utils.syncLoop(populatedProfile.staff.length, function(loop, returnedProfile) {

                if (sendMail.exclude && sendMail.exclude.length) {

                  var sendMailTo = sendMail.exclude.every(function(everyOldStaff) {

                    if (everyOldStaff.manager_ref == populatedProfile.staff[loop.iteration()].manager_ref._id) {
                      return false;
                    }

                    return true;
                  });

                  if (sendMailTo) {
                    mailOptions.to = populatedProfile.staff[loop.iteration()].manager_ref.email;

                    utils.sendMail(mailOptions);
                    loop.next();
                  } else {
                    loop.next();
                  }

                } else {

                  mailOptions.to = populatedProfile.staff[loop.iteration()].manager_ref.email;

                  utils.sendMail(mailOptions);
                  loop.next();

                }

              }, function(returnedProfile) {
                done(null, returnedProfile)
              }, populatedProfile);

            });
          }

        });
      }
    }

  ], function(err, returnedProfile) {

    if (err)
      returnedProfile = null;
    if (exit) {
      exit(null, returnedProfile);
    } else {
      return returnedProfile;
    }
  });
}

OrganizerController.prototype.getProfileStub = function(orgId, res) {

  async.waterfall([

    function(done) {

      Organizer.findById(orgId, function(err, org) {

        if (err) {
          if (res) {
            return res.send(err);
          } else {
            return null;
          }

        } else if (!org) {

          if (res) {
            return res.status(422).send({
              success: false,
              message: 'Invalid organizer id'
            });
          } else {
            return null;
          }
        } else if (org.user_ref) {

          Organizer.populate(org, {
            path: 'user_ref'
          }, function(err1, org1) {

            if (err) {
              done(null, org);
            } else {
              done(null, org1);
            }
          });
        } else {
          done(null, org);
        }

      });
    },
    function(org, done) {

      if (org.staff.length) {

        Organizer.populate(org, {
          path: 'staff.manager_ref'
        }, function(err1, org1) {

          if (err1) {
            done(null, org);
          } else {
            done(null, org1);
          }

        });
      } else {
        done(null, org);
      }
    }

  ], function(err, org) {

    if (err) {
      if (res) {
        return res.send(err);
      } else {
        return null;
      }
    }

    if (res) {
      res.json(org);
    } else {
      return org;
    }

  });

}

module.exports = OrganizerController;
