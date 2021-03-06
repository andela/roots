'use strict';

var User = require('../models/user.model');
var Organizer = require('../models/organizer.model');

var Utils = require('../middleware/utils');
var utils = new Utils();

var OrganizerController = function() {};


OrganizerController.prototype.deleteProfile = function(req, res, next) {

  var organizerId;

  User.findById({
    _id: req.decoded._id
  }, function(err, user) {

    if (err) {
      return res.json(err);
    } else {
      if (!user) {
        return res.status(422).send({
          success: false,
          message: 'Unable to retrieve user details!'
        });
      } else if (!user.organizer_ref) {

        return res.status(422).send({
          success: false,
          message: 'No organizer profile attached to user record!'
        });
      } else {

        User.findByIdAndUpdate({
          _id: req.decoded._id
        }, {
          organizer_ref: undefined
        }, function(err, user) {
          if (err) {
            return res.json(err);
          }
          Organizer.remove({
            user_ref: req.decoded._id
          }, function(err, orgProfile) {
            if (err) {
              return res.json(err);
            } else {
              return res.json({
                success: true,
                message: 'Organizer profile deleted!'
              });
            }
          });
        });
      }
    }
  });
};


OrganizerController.prototype.createProfile = function(req, res) {
  
  var profile;

  if (!req.body.formDataObject) {
    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  } else {

    profile = req.body.formDataObject;
    
    User.findOne({
      email: req.decoded.email
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
        newOrgProfile.name = profile.name;
        newOrgProfile.about = profile.about;
        newOrgProfile.imageUrl = profile.imageUrl;
        newOrgProfile.staff = [];

        newOrgProfile.save(function(err, orgProfile) {
          if (err) {
            if (err.code == 11000) {
              return res.status(422).json({
                success: false,
                message: 'Organizer name taken!'
              });
            } else {
              return res.json(err);
            }
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
            return res.json(orgProfile);
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

  var orgProfile;

  if (!req.body.formDataObject) {
    return res.status(422).send({
      success: false,
      message: 'Please check parameters!'
    });
  }
 
  Organizer.findById(req.params.organizer_id, function(err, profile) {

    if (err) {
      return res.status(500).send(err);
    } else if (!profile) {

      return res.status(422).send({
        success: false,
        message: 'Invalid organizer id'
      });

    } else if (profile.user_ref.toString() !== req.decoded._id) {
      
      return res.status(401).send({
        success: false,
        message: 'Unauthorized!'
      });

    } else {
      orgProfile = req.body.formDataObject;
      
      //Prevent imageUrl field being assigned string 'null'
      orgProfile.imageUrl = orgProfile.imageUrl || "";
      
      Organizer.findByIdAndUpdate(req.params.organizer_id, {
        $set: {
          name: orgProfile.name,
          about: orgProfile.about,
          imageUrl: orgProfile.imageUrl
        }
      }, {
        'new': true
      }, function(err, organizer) {
        if (err) {
          return res.status(500).send(err);
        } else {
          User.populate(organizer, {
            path: 'user_ref staff.manager_ref'
          }, function(err1, org) {

            if (err) {
              return res.status(500).send(err);
            } else {
              res.json(org);
            }
          });
        }
      });
    }
  });
}

OrganizerController.prototype.addTeamMember = function(req, res) {

  var orgId = req.params.organizer_id;
  var manager = req.body.manager;
  var managerEmail;

  if (!manager || !manager.manager_ref || !manager.role) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }

  Organizer.findById(orgId, function(err, orgProfile) {

    if (err) {
      return res.status(500).send(err);
    } else if (!orgProfile) {
      return res.status(422).send({
        success: false,
        message: 'Profile not found'
      });
    } else {

      if (orgProfile.user_ref.toString() !== req.decoded._id) {

        return res.status(403).send({
          success: false,
          message: 'Unauthorized!'
        });
      } else {

        User.findById(manager.manager_ref, function(err, user) {


          if (err) {
            return res.status(500).send(err);
          } else if (!user) {
            return res.status(422).send({
              success: false,
              message: 'Invalid manager id!'
            });
          } else {

            managerEmail = user.email;
            Organizer.findOne({
              _id: orgId,
              'staff.manager_ref': manager.manager_ref
            }, function(err, org) {


              if (err) {
                return res.status(500).send(err);
              } else if (org) {
                return res.status(422).send({
                  success: false,
                  message: 'Manager already exists in organizer profile!'
                });
              } else {

                Organizer.findByIdAndUpdate(orgId, {
                  $push: {
                    staff: {
                      manager_ref: manager.manager_ref,
                      role: manager.role
                    }
                  }
                }, {
                  new: true
                }, function(err, updatedProfile) {

                  var mailOptions = {
                    to: managerEmail,
                    from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                    subject: updatedProfile.name + ' added you',
                    text: updatedProfile.name + ' added you',
                    html: 'Hello,\n\n' +
                      'You have been added as staff to <b>' + updatedProfile.name + '</b> event manager.\n'
                  };

                  utils.sendMail(mailOptions);

                  Organizer.findById(orgId, {
                    staff: {
                      $elemMatch: {
                        manager_ref: manager.manager_ref
                      }
                    }
                  }, function(err, newRecord) {
                    if (err || !newRecord) {
                      return res.status(422).send({
                        success: false,
                        message: 'Manager added, but unable to retrieve record!'
                      });
                    } else {

                      res.json(newRecord.staff[0]);
                    }
                  });
                });
              }
            });
          }
        });
      }
    }
  });
}

OrganizerController.prototype.editRole = function(req, res) {

  var orgId = req.params.organizer_id;
  var memberId = req.params.member_id;

  var newRole = req.body.newRole;

  if (!newRole) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  } else {

    Organizer.findOneAndUpdate({
      _id: orgId,
      'staff._id': memberId
    }, {
      $set: {
        'staff.$.role': newRole
      }
    }, function(err, organizer) {

      if (err) {
        return res.status(500).send(err);
      } else if (!organizer) {

        return res.status(422).send({
          success: false,
          message: 'Update failed!'
        });
      } else {
        return res.json({
          success: true,
          message: 'Role updated!'
        });
      }
    });
  }
}

OrganizerController.prototype.deleteStaff = function(req, res) {

  var orgId = req.params.organizer_id;
  var memberId = req.params.member_id;

  Organizer.findOneAndUpdate({
    _id: orgId
  }, {
    $pull: {
      'staff': {
        _id: memberId
      }
    }
  }, function(err, organizer) {

    if (err) {
      return res.status(500).send(err);
    } else if (!organizer) {

      return res.status(422).send({
        success: false,
        message: 'No record deleted!'
      });
    } else {
      return res.json({
        success: true,
        message: 'Record deleted!'
      });
    }
  });
}

OrganizerController.prototype.getCurrentProfile = function(req, res) {  

  //find organizer by the user reference (user_ref) instead of org_id
  Organizer.findOne({ user_ref: req.decoded._id }, function(err, org) {
    if (err) {
      return res.status(500).send(err);
    } else if (!org) {

      return res.status(422).send({
        success: false,
        message: 'Invalid organizer id'
      });
    } else {

      User.populate(org, {
        path: 'user_ref staff.manager_ref'
      }, function(err1, org1) {

        if (err) {
          return res.status(500).send(err);
        } else {
          res.json(org1);
        }
      });
    }
  });
}

OrganizerController.prototype.getProfile = function(req, res) {

  var orgId = req.params.organizer_id;

  //find organizer by the user reference (user_ref) instead of org_id
  Organizer.findById(orgId, function(err, org) {
    if (err) {
      return res.status(500).send(err);
    } else if (!org) {

      return res.status(422).send({
        success: false,
        message: 'Invalid organizer id'
      });
    } else {
        res.json(org);  
    }
  });
}

OrganizerController.prototype.getAllProfiles = function(req, res) {
  Organizer.find(function(err, organizers) {
    if (err) {
      return res.json(err);
    }
    User.populate(organizers, {
      path: 'user_ref staff.manager_ref'
    }, function(err, populatedProfiles) {

      if (err) {
        return res.json(err);
      }
      res.json(populatedProfiles);

    });
  });

}

module.exports = OrganizerController;
