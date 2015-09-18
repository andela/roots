var express = require('express');
var UserController = require('../controllers/user.controller');
var OrganizerController = require('../controllers/organizer.controller');
var EventController = require('../controllers/event.controller');
var orgCtrl = new OrganizerController();
var userCtrl = new UserController();
var evCtrl = new EventController();
var router = express.Router();

module.exports = function(app) {

  router.route('/organizer')
    .post(userCtrl.verifyToken, evCtrl.imageProcessing, orgCtrl.createProfile);

  router.route('/organizers')
    .get(userCtrl.verifyToken, orgCtrl.getAllProfiles);

  router.route('/organizer/:organizer_id/team')
    .post(userCtrl.verifyToken, orgCtrl.addTeamMember);

  router.route('/organizer/:organizer_id/team/:member_id')
    .put(userCtrl.verifyToken, orgCtrl.editRole)
    .delete(userCtrl.verifyToken, orgCtrl.deleteStaff);

  router.route('/organizer/:organizer_id')
    .get(userCtrl.verifyToken, orgCtrl.getProfile)
    .put(userCtrl.verifyToken, orgCtrl.editProfile);

  app.use('/api', router);
}