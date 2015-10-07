var express = require('express');
var UserController = require('../controllers/user.controller');
var Utils = require('../middleware/utils');
var ctrl = new UserController();
var router = express.Router();
var utils = new Utils();

module.exports = function(app) {
 
  router.route('/users')
   .post(ctrl.userSignup)
   .get(ctrl.getUsers)
   .delete(ctrl.deleteAll);

  router.route('/user')
   .get(ctrl.verifyToken, ctrl.getCurrentUser)
   .put(ctrl.verifyToken, ctrl.editUser)
   .delete(ctrl.verifyToken, ctrl.deleteCurrentUser);

  router.route('/twitterUser/:user_id')
    .put(ctrl.editTwitUser);

  router.route('/authenticate')
    .post(ctrl.authenticate);

  router.route('/user/welcomeMail')
    .post(ctrl.welcomeMail);

  router.route('/decode')
    .get(ctrl.verifyToken, ctrl.decodeUser);
    
  router.route('/forgotPass')
    .post(ctrl.forgotPass);

  router.route('/reset/:token')
    .post(ctrl.resetPass);

  router.route('/user/uploadpic')
    .post(ctrl.verifyToken, utils.imageProcessing, ctrl.uploadPicture);

  app.use('/api', router);
};