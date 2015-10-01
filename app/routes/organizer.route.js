var express = require('express');
var UserController = require('../controllers/user.controller');
var OrganizerController = require('../controllers/organizer.controller');
var EventController = require('../controllers/event.controller');
var orgCtrl = new OrganizerController();
var userCtrl = new UserController();
var evtCtrl = new EventController();
var router = express.Router();

module.exports = function(app) {

  router.route('/organizer')
    .post(userCtrl.verifyToken, orgCtrl.deleteUserOrgProfile, evtCtrl.imageProcessing, orgCtrl.createProfile);

  router.route('/organizers')
    .get(orgCtrl.getAllProfiles);

  router.route('/organizer/:organizer_id/team')
    .post(userCtrl.verifyToken, orgCtrl.addTeamMember);

  router.route('/organizer/:organizer_id/team/:member_id')
    .put(userCtrl.verifyToken, orgCtrl.editRole)
    .delete(userCtrl.verifyToken, orgCtrl.deleteStaff);

  router.route('/myorganizer')
    .get(userCtrl.verifyToken, orgCtrl.getProfile)
    .put(userCtrl.verifyToken, orgCtrl.editProfile)
    .delete(orgCtrl.deleteProfile);

  app.use('/api', router);
};
