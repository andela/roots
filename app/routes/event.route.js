var express = require('express');
var UserController = require('../controllers/user.controller');
var EventController = require('../controllers/event.controller');
var Utils = require('../middleware/utils');
var evtCtrl = new EventController();
var userCtrl = new UserController();
var router = express.Router();
var utils = new Utils();


module.exports = function(app) {

  router.route('/event')
    //Get user's list of your published events
    .get(userCtrl.verifyToken, evtCtrl.getMyEvents)

    //Create new event
    .post(userCtrl.verifyToken, utils.imageProcessing, evtCtrl.createEvent);

  router.route('/events')
    //Get all published event
    .get(evtCtrl.getAllEvents);

  router.route('/event/:event_id')
    //Get an event's details
    .get(evtCtrl.getEvent)
    //Edit an event details
    .put(userCtrl.verifyToken, utils.imageProcessing, evtCtrl.editEventDetails)
    //Delete an event
    .delete(userCtrl.verifyToken, evtCtrl.deleteEvent);

  router.route('/event/:event_id/launch')
    //Publish an event
    .put(userCtrl.verifyToken, evtCtrl.launchEvent);

  router.route('/event/:event_id/save')
    //Save an event's details
    .post(userCtrl.verifyToken, evtCtrl.saveEventDetails);

  //Get list of event drafts
  router.route('/events/saved')
    .get(userCtrl.verifyToken, evtCtrl.getMySavedEvents);

  //Reuse an event
  router.route('/event/:event_id/reuse')
    .post(userCtrl.verifyToken, evtCtrl.reuseEvent);

  app.use('/api', router);
}