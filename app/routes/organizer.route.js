var express = require('express');
var UserController = require('../controllers/user.controller');
var OrganizerController = require('../controllers/organizer.controller');
var orgCtrl = new OrganizerController();
var userCtrl = new UserController();
var router = express.Router();

module.exports = function(app) {

  router.route('/organizer')
    .post(userCtrl.verifyToken, orgCtrl.createProfile);

  router.route('/organizers')
    .get(userCtrl.verifyToken, orgCtrl.getAllProfiles);

  router.route('/organizer/team')
    .post(userCtrl.verifyToken, orgCtrl.addTeamMembers);

  router.route('/organizer/:organizer_id')
    .get(userCtrl.verifyToken, orgCtrl.getProfile)
    .put(userCtrl.verifyToken, orgCtrl.editProfile);

  app.use('/api', router);
}
