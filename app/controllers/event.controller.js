'use strict';

var User = require('../models/user.model');
var Event = require('../models/event.model');
var Task = require('../models/task.model');
var Utils = require('../middleware/utils');
var TaskController = require('./task.controller');

var utils = new Utils();
var taskController = new TaskController();

var EventController = function() {};

EventController.prototype.createEvent = function(req, res) {

  if (!req.body.eventObj) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }

  var userId = req.decoded._id;
  var eventTasks = req.body.eventObj.tasks;
  var eventObj = req.body.eventObj;
  eventObj.user_ref = userId;
  eventObj.tasks = [];

  Event.create(eventObj, function(err, newEvent) {

    if (err) {
      return res.status(500).send(err);
    }

    var mailOptions = {
      to: req.decoded.email,
      from: 'World tree ✔ <no-reply@worldtreeinc.com>',
      subject: newEvent.name + ' created',
      text: newEvent.name + ' created',
      html: 'Hello,\n\n' +
        'You just created <b>' + newEvent.name + '</b>.\n'
    };

    utils.sendMail(mailOptions);

    res.json(newEvent);
  });
}

EventController.prototype.editEventDetails = function(req, res) {

  if (!req.body.eventObj) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }

  var eventObj = req.body.eventObj;
  var eventId = req.params.event_id;

  Event.findById(eventId, function(err, evt) {

    if (err) {
      return res.status(500).send(err);
    } else if (!evt) {
      return res.status(422).send({
        success: false,
        message: 'Event not found!'
      });
    } else if (evt.user_ref.toString() !== req.decoded._id) {

      return res.status(401).send({
        success: false,
        message: 'Unauthorized!'
      });
    } else {

      Event.findByIdAndUpdate(eventId, {
        $set: {
          name: eventObj.name,
          description: eventObj.description,
          category: eventObj.category,
          venue: eventObj.venue,
          eventUrl: eventObj.eventUrl,
          eventTheme: eventObj.eventTheme,
          eventFontColor: eventObj.eventFontColor,
          startDate: eventObj.startDate,
          endDate: eventObj.endDate
        }
      }, {
        new: true
      }, function(err, evt) {

        if (err) {
          return res.status(500).send(err);
        } else if (!evt) {
          return res.status(422).send({
            success: false,
            message: 'Event not found!'
          });
        } else {
          res.json(evt);
        }
      });
    }
  });
}

EventController.prototype.getAllEvents = function(req, res) {

  Event.find(function(err, events) {
    if (err) {
      return res.json(err);
    }
    User.populate(events, {
      path: 'user_ref manager_ref'
    }, function(err, populatedEvents) {

      if (err) {
        return res.json(err);
      }

      res.json(populatedEvents);

    });
  });
}

EventController.prototype.deleteEvent = function(req, res) {

  var eventId = req.params.event_id;


  Event.findById(eventId, function(err, evt) {

    if (err) {
      return res.status(500).send(err);
    } else if (!evt) {
      return res.status(422).send({
        success: false,
        message: 'Event not found!'
      });
    } else if (evt.user_ref.toString() !== req.decoded._id) {

      return res.status(401).send({
        success: false,
        message: 'Unauthorized!'
      });
    } else {

      Task.remove({
        event_ref: eventId
      }, function(err) {

        if (err)
          return res.status(500).send(err);

        Event.remove({
          _id: eventId
        }, function(err, evt) {
          if (err)
            return res.status(500).send(err);

          res.json({
            message: 'Succesfully deleted'
          });
        });
      });
    }
  });
}

EventController.prototype.getEvent = function(req, res) {

  var eventId = req.params.event_id;

  Event.findById(eventId, function(err, evt) {

    if (err) {

      return res.status(500).send(err);
    } else if (!evt) {

      return res.status(422).send({
        success: false,
        message: 'Invalid event id'
      });
    } else {

      User.populate(evt, {
        path: 'user_ref'
      }, function(err1, evt1) {

        if (err) {
          res.status(500).send(err);
        } else {
          res.json(evt1);
        }

      });
    }
  });
}

module.exports = EventController;
