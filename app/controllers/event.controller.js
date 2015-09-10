'use strict';

var User = require('../models/user.model');
var Event = require('../models/event.model');
var Task = require('../models/task.model');
var Utils = require('../middleware/utils');

var utils = new Utils();

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
          eventFont: eventObj.eventFont,
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

//Set event in saved state to online state
EventController.prototype.launchEvent = function(req, res) {

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
          online: true
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
          evt.save(function(err) {

            if (err) {
              return res.status(500).send(err);
            } else {
              User.populate(evt, {
                path: 'user_ref'
              }, function(err1, evt) {

                if (err) {
                  res.status(500).send(err);
                } else {
                  res.json(evt);
                }

              });
            }
          });
        }
      });
    }
  });
}

//Add an event to your saved events
EventController.prototype.saveEventDetails = function(req, res) {

  var eventId = req.params.event_id;

  Event.findById(eventId, function(err, evt) {

    if (err) {
      return res.status(500).send(err);
    } else if (!evt) {
      return res.status(422).send({
        success: false,
        message: 'Event not found!'
      });
    } else {

      var newEvent = new Event();

      newEvent.name = evt.name;
      newEvent.description = evt.description;
      newEvent.category = evt.category;
      newEvent.venue = evt.venue;
      newEvent.eventUrl = evt.eventUrl;
      newEvent.eventTheme = evt.eventTheme;
      newEvent.eventFont = evt.eventFont;
      newEvent.startDate = evt.startDate;
      newEvent.endDate = evt.endDate;
      newEvent.online = false;
      newEvent.user_ref = req.decoded._id;

      newEvent.save(function(err) {

        if (err) {
          return res.status(500).send(err);
        } else {
          User.populate(newEvent, {
            path: 'user_ref'
          }, function(err1, newEvt) {

            if (err) {
              res.status(500).send(err);
            } else {
              res.json(newEvt);
            }

          });
        }
      });
    }
  });
}

//Get all events that are online
EventController.prototype.getAllEvents = function(req, res) {

  Event.find({
    online: true
  }, function(err, events) {
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

//Get your online events
EventController.prototype.getMyEvents = function(req, res) {

  Event.find({
    user_ref: req.decoded._id,
    online: true
  }, function(err, events) {
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

//Get your saved/offline events
EventController.prototype.getMySavedEvents = function(req, res) {

  Event.find({
    user_ref: req.decoded._id,
    online: false
  }, function(err, events) {
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

EventController.prototype.reuseEvent = function(req, res) {

  var eventId = req.params.event_id;
  var clonedEventId;

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

      var newEvent = JSON.parse(JSON.stringify(evt));
      delete newEvent._id;
      newEvent.feedback = [];
      newEvent.tasks = [];
      newEvent.online = false;

      newEvent = new Event(newEvent);
      newEvent.save(function(err) {

        if (err) {
          return res.status(500).send(err);
        } else {

          clonedEventId = newEvent._id;

          Task.find({
            event_ref: eventId
          }, function(err, tasks) {

            if (err) {
              res.json(newEvent);
            } else {


              utils.syncLoop(tasks.length, function(loop, loopTasks, eventId) {

                var task = JSON.parse(JSON.stringify(tasks[loop.iteration()]));

                delete task._id;
                task.volunteers = [];
                task.completed = false;
                task.event_ref = eventId;

                task = new Task(task);
                task.save(function(err) {

                  if (!err) {

                    loop.next();
                  }
                });
              }, function(processedTasks, eventId) {

                Event.findById(eventId, function(err, evt) {

                  if (err) {
                    return res.status(500).send(err);
                  } else {

                    User.populate(evt, {
                      path: 'user_ref manager_ref'
                    }, function(err, populatedEvents) {

                      if (err) {
                        return res.json(err);
                      }

                      res.json(populatedEvents);
                    });
                  }

                });

              }, tasks, clonedEventId);
            }
          });
        }
      });
    }
  });
}

module.exports = EventController;
