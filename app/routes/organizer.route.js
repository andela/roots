var express = require('express');
var UserController = require('../controllers/user.controller');
var OrganizerController = require('../controllers/organizer.controller');
var orgCtrl = new OrganizerController();
var userCtrl = new UserController();
var router = express.Router();

module.exports = function(app) {

  router.route('/organizer')
    .post(userCtrl.verifyToken, orgCtrl.createProfile)
    .put(userCtrl.verifyToken, orgCtrl.editProfile);    

  router.route('/organizer-members')
    .put(userCtrl.verifyToken, orgCtrl.addTeamMembers);

  router.route('/organizer/:organizer_id')
   .get(userCtrl.verifyToken, orgCtrl.getProfile);

  app.use('/api', router);
}
