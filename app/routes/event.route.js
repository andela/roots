var express = require('express');
var UserController = require('../controllers/user.controller');
var EventController = require('../controllers/event.controller');
var evtCtrl = new EventController();
var userCtrl = new UserController();
var router = express.Router();

module.exports = function(app) {

  router.route('/event')
    .post(userCtrl.verifyToken, evtCtrl.imageProcessing, evtCtrl.registerEvent);
  router.route('/events')
    .get(evtCtrl.getAllEvents);


  router.route('/event/:event_id')
    .get(evtCtrl.getEvent)
    .put(userCtrl.verifyToken, evtCtrl.editEventDetails)
    .delete(userCtrl.verifyToken, evtCtrl.deleteEvent);

    router.route('/event/:event_id/tasks')
    .put(userCtrl.verifyToken, evtCtrl.editEventTasks);

  app.use('/api', router);
}
