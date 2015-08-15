'use strict';

var User = require('../models/user.model');
var async = require('async');
var Organizer = require('../models/organizer.model');
var Utils = require('../middleware/utils');


var utils = new Utils();

var OrganizerController = function() {};

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
                message: 'User already registered as Organizer!'
              });
            return res.json(err);
          }

          if (newStaff) {

            OrganizerController.prototype.addTeamMembersStub(orgProfile, newStaff);

          };

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
          message: 'User not in db!'
        });
      };
    });
  }
};

OrganizerController.prototype.editProfile = function(req, res) {

  Organizer.update({
    _id: req.params.organizer_ref
  }, req.body, function(err, organizer) {
    if (err) {
      return res.json(err);
    }
    return res.json({
      success: true,
      message: 'Organizer profile updated'
    });
  });
};

OrganizerController.prototype.getProfile = function(req, res) {

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

    var updatedProfile = OrganizerController.prototype.addTeamMembersStub(orgProfile, req.body.newStaff);

    if (!updatedProfile)
      return res.status(422).send({
        success: false,
        message: 'Unable to add members'
      });

    res.json(updatedProfile);
  });
}

OrganizerController.prototype.addTeamMembersStub = function(orgProfile, newStaff) {

  async.waterfall([

    function(done) {

      var validatedStaff = [];

      newStaff.forEach(function(person) {

        User.findOne({
          email: person.email
        }, function(err, personData) {
          console.log('personData', personData);
          if (personData) {

            Organizer.findOne({
              _id: orgProfile._id,
              'staff.manager_ref': personData._id
            }, function(err, duplicate) {

              if (!err && !duplicate) {
                validatedStaff.push({
                  manager_ref: personData._id,
                  role: person.role
                });
                console.log(0, validatedStaff);
              }

            });
          }
        });
      });
      done(null, validatedStaff);

    },

    function(validatedStaff, done) {

      var returnedProfile;
      console.log(2, validatedStaff);

      if(!validatedStaff || !validatedStaff.length){
        return null;
      }
      
      //Add validated users as staff
      
      validatedStaff.forEach(function(eachStaff){

        orgProfile.staff.push(eachStaff);

      });      
     
      orgProfile.save(function(err, saved) {
        if (err)
          return null;

        //Send notification mail to all added staff
        Organizer.findOne({
          _id: orgProfile._id
        }).populate('manager_ref').exec(function(err, populatedProfile) {

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

          populatedProfile.staff.forEach(function(addedStaff) {

            mailOptions.to = addedStaff.manager_ref.email;
            utils.sendMail(mailOptions);

          });
          returnedProfile = populatedProfile;

        });

      });

      done(null, returnedProfile);
    }



  ], function(err, returnedProfile) {

    if (err)
      return null;

    return returnedProfile;
  });


  // var validatedStaff = [];

  // newStaff.forEach(function(person) {

  //   User.findOne({
  //     email: person.email
  //   }, function(err, personData) {
  //     console.log('personData', personData);
  //     if (personData) {

  //       Organizer.findOne({
  //         _id: orgProfile._id,
  //         'staff.manager_ref': personData._id
  //       }, function(err, duplicate) {

  //         if (!err && !duplicate) {
  //           validatedStaff.push({
  //             manager_ref: personData._id,
  //             role: person.role
  //           });
  //           console.log(0, validatedStaff);
  //         }

  //       });
  //     }
  //   });
  // });

  // console.log(2, validatedStaff);
  // //Add validated users as staff
  // orgProfile.staff = validatedStaff;

  // orgProfile.save(function(err, saved) {
  //   if (err)
  //     return false;

  //   //Send notification mail to all added staff
  //   Organizer.findOne({
  //     _id: orgProfile._id
  //   }).populate('manager_ref').exec(function(err, populatedProfile) {

  //     if (err)
  //       return false;

  //     var mailOptions = {
  //       to: '',
  //       from: 'World tree ✔ <no-reply@worldtreeinc.com>',
  //       subject: populatedProfile.name + ' added you',
  //       text: populatedProfile.name + ' added you',
  //       html: 'Hello,\n\n' +
  //         'You have been added as staff to <b>' + populatedProfile.name + '</b> event manager.\n'
  //     };

  //     populatedProfile.staff.forEach(function(addedStaff) {

  //       mailOptions.to = addedStaff.manager_ref.email;
  //       utils.sendMail(mailOptions);

  //     });
  //     return populatedProfile;

  //   });

  // });

}

module.exports = OrganizerController;
