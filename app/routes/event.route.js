var express = require('express');
var UserController = require('../controllers/user.controller');
var EventController = require('../controllers/event.controller');
var evtCtrl = new EventController();
var userCtrl = new UserController();
var router = express.Router();

module.exports = function(app) {

  router.route('/event')
    .post(userCtrl.verifyToken, evtCtrl.createEvent);
  router.route('/events')
    .get(evtCtrl.getAllEvents);


  router.route('/event/:event_id')
    .get(evtCtrl.getEvent)
    .delete(userCtrl.verifyToken, evtCtrl.deleteEvent);

  app.use('/api', router);
}
