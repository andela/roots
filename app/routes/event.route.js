var express = require('express');
var UserController = require('../controllers/user.controller');
var EventController = require('../controllers/event.controller');
var evtCtrl = new EventController();
var userCtrl = new UserController();
var router = express.Router();

module.exports = function(app) {

  router.route('/event')
<<<<<<< HEAD
    .post(userCtrl.verifyToken, evtCtrl.createEvent)
    .get(userCtrl.verifyToken, evtCtrl.getMyEvents);

=======
    .post(userCtrl.verifyToken, evtCtrl.imageProcessing, evtCtrl.registerEvent);
>>>>>>> feat(main app): frontend
  router.route('/events')
    .get(evtCtrl.getAllEvents);

  router.route('/event/:event_id')
    .get(evtCtrl.getEvent)
    .put(userCtrl.verifyToken, evtCtrl.editEventDetails)
    .delete(userCtrl.verifyToken, evtCtrl.deleteEvent);

  router.route('/event/:event_id/launch')
    .put(userCtrl.verifyToken, evtCtrl.launchEvent);

  router.route('/event/:event_id/save')
    .post(userCtrl.verifyToken, evtCtrl.saveEventDetails);

  router.route('/events/saved')
    .get(userCtrl.verifyToken, evtCtrl.getMySavedEvents);

  router.route('/event/:event_id/reuse')
    .post(userCtrl.verifyToken, evtCtrl.reuseEvent);

  app.use('/api', router);
}
