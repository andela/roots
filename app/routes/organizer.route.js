var express = require('express');
var UserController = require('../controllers/user.controller');
var OrganizerController = require('../controllers/organizer.controller');
var EventController = require('../controllers/event.controller');
var Utils = require('../middleware/utils');
var orgCtrl = new OrganizerController();
var userCtrl = new UserController();
var evCtrl = new EventController();
var router = express.Router();
var utils = new Utils();

module.exports = function(app) {

  //Create an organizer profile for a user
  router.route('/organizer')
    .post(userCtrl.verifyToken, utils.imageProcessing, orgCtrl.createProfile)
    //Get user's organizer details
    .get(userCtrl.verifyToken, orgCtrl.getCurrentProfile)
    .delete(userCtrl.verifyToken, orgCtrl.deleteProfile);

  //Get all organizer profiles
  router.route('/organizers')
    .get(userCtrl.verifyToken, orgCtrl.getAllProfiles);

  //Add a team member to an organizer profile
  router.route('/organizer/:organizer_id/team')
    .post(userCtrl.verifyToken, orgCtrl.addTeamMember);


  router.route('/organizer/:organizer_id/team/:member_id')
    //Edit a team member role
    .put(userCtrl.verifyToken, orgCtrl.editRole)
    //Delete a team member
    .delete(userCtrl.verifyToken, orgCtrl.deleteStaff);

  router.route('/organizer/:organizer_id')
    //Get organizer profile details by id
    .get(orgCtrl.getProfile)
    //Edit organizer profile details
    .put(userCtrl.verifyToken, utils.imageProcessing, orgCtrl.editProfile);

  app.use('/api', router);
}