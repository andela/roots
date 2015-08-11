'use strict';

var async = require('async');
var User = require('../models/user.model');
var Event = require('../models/event.model');
var Task = require('../models/task.model');
var Utils = require('../middleware/utils');
var TaskController = require('./task.controller');

var utils = new Utils();
var taskController = new TaskController();

var EventController = function() {};

EventController.prototype.createEvent = function(req, res) {

  if (!req.body.userId || !req.body.eventObj) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }

  var userId = req.body.userId;
  var eventTasks = req.body.eventObj.tasks;
  var eventObj = req.body.eventObj;
  eventObj.user_ref = userId;
  eventObj.tasks = [];

  Event.create(eventObj, function(err, newEvent) {

    if (err) {
      return res.send(err);
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

    async.waterfall([function(done) {

        if (eventTasks && eventTasks.length) {

          utils.syncLoop(eventTasks.length, function(loop, tasksToAdd) {

              taskController.addOrEditTaskStub(newEvent._id, tasksToAdd[loop.iteration()], null, loop);
            },
            function(processedTasks) {

              done(null, processedTasks);
            }, eventTasks);

        } else {
          done(null, []);
        }
      }],
      function(err) {
        EventController.prototype.getEventStub(newEvent._id, res);
      });
  });
}

EventController.prototype.editEventDetails = function(req, res) {

  if (!req.body.eventObj || !req.body.eventObj._id) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }


  Event.findById(req.body.eventObj._id, function(err, evt) {

    if (err) {
      return res.send(err);
    } else if (!evt) {
      return res.status(422).send({
        success: false,
        message: 'Event not found!'
      });
    } else if (evt.user_ref != req.decoded._id) {

      return res.status(401).send({
        success: false,
        message: 'Unauthorized!'
      });
    } else {

      var eventObj = req.body.eventObj;

      Event.findByIdAndUpdate(eventObj._id, {
        $set: {
          name: eventObj.name,
          description: eventObj.description,
          category: eventObj.category,
          venue: eventObj.venue,
          eventUrl: eventObj.eventUrl,
          startDate: eventObj.startDate,
          endDate: eventObj.endDate
        }
      }, function(err, evt) {

        if (err) {
          return res.send(err);
        } else if (!evt) {
          return res.status(422).send({
            success: false,
            message: 'Event not found!'
          });
        } else {
          EventController.prototype.getEventStub(evt._id, res);
        }
      });

    }
  });
}

EventController.prototype.editEventTasks = function(req, res) {

  if (!req.body.eventTasks) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }

  var eventTasks = req.body.eventTasks;
  var eventId = req.params.event_id;

  Event.findById(eventId, function(err, evt) {

    if (err) {
      return res.send(err);
    } else if (!evt) {
      return res.status(422).send({
        success: false,
        message: 'Event not found!'
      });
    } else if (evt.user_ref != req.decoded._id) {

      return res.status(401).send({
        success: false,
        message: 'Unauthorized!'
      });
    } else {

      var oldTasks = evt.tasks;
      var tasksToRemove = [];
      var filteredTasks = EventController.prototype.filterTasks(eventTasks);

      oldTasks.forEach(function(oldTask) {

        var remove = filteredTasks.every(function(filteredTask) {

          if (oldTask.task_ref == filteredTask.task_ref) {
            return false;
          }
          return true;
        });

        if (remove) {
          tasksToRemove.push(oldTask);
        }
      });


      async.waterfall([

          function(done) {

            utils.syncLoop(tasksToRemove.length, function(loop, tasks) {

              taskController.deleteTaskStub(eventId, tasks[loop.iteration()].task_ref, null, loop);

            }, function(tasks) {

              done(null, tasks);
            }, tasksToRemove)

          },
          function(evt, done) {

            utils.syncLoop(filteredTasks.length, function(loop, tasks) {

              taskController.addOrEditTaskStub(eventId, tasks[loop.iteration()], null, loop);

            }, function(tasks) {

              done(null, tasks);
            }, filteredTasks)
          }
        ],
        function(err, evt) {

          if (err) {
            return res.send(err);
          } else {

            EventController.prototype.getEventStub(eventId, res);
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
    Event.populate(events, {
      path: 'user_ref tasks.task_ref'
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
      return res.send(err);
    } else if (!evt) {
      return res.status(422).send({
        success: false,
        message: 'Event not found!'
      });
    } else if (evt.user_ref != req.decoded._id) {

      return res.status(401).send({
        success: false,
        message: 'Unauthorized!'
      });
    } else {

      Task.remove({
        event_ref: eventId
      }, function(err) {

        if (err)
          return res.send(err);

        Event.remove({
          _id: eventId
        }, function(err, evt) {
          if (err)
            return res.send(err);

          res.json({
            message: 'Succesfully deleted'
          });
        });
      });
    }
  });
}

EventController.prototype.getEvent = function(req, res) {

  EventController.prototype.getEventStub(req.params.event_id, res);
}

EventController.prototype.getEventStub = function(eventId, res) {

  async.waterfall([

    function(done) {

      Event.findById(eventId, function(err, evt) {

        if (err) {
          if (res) {
            return res.send(err);
          } else {
            return null;
          }

        } else if (!evt) {

          if (res) {
            return res.status(422).send({
              success: false,
              message: 'Invalid event id'
            });
          } else {
            return null;
          }
        } else if (evt.user_ref) {

          Event.populate(evt, {
            path: 'user_ref'
          }, function(err1, evt1) {

            if (err) {
              done(null, evt);
            } else {
              done(null, evt1);
            }
          });
        } else {
          done(null, evt);
        }

      });
    },
    function(evt, done) {

      if (evt.tasks.length) {

        Event.populate(evt, {
          path: 'tasks.task_ref'
        }, function(err1, evt1) {

          if (err1) {
            done(null, evt);
          } else {
            done(null, evt1);
          }

        });
      } else {
        done(null, evt);
      }
    },
    function(evt, done) {

      if (evt.tasks.length) {

        Event.populate(evt, {
          path: 'tasks.task_ref.manager_ref tasks.task_ref.volunteers.volunteer_ref'
        }, function(err1, evt1) {

          if (err1) {
            done(null, evt);
          } else {
            if (evt1 == [])
              evt1 = evt;

            done(null, evt1);
          }

        });
      } else {
        done(null, evt);
      }
    }

  ], function(err, evt) {

    if (err) {
      if (res) {
        return res.send(err);
      } else {
        return null;
      }
    }

    if (res) {
      res.json(evt);
    } else {
      return evt;
    }

  });
}

EventController.prototype.filterTasks = function(newTasks) {

  var filteredTasks = [];

  newTasks.forEach(function(task) {

    var taskToReplace;
    var notDuplicate = filteredTasks.every(function(addedTask) {

      if (addedTask.manager_ref == task.manager_ref || addedTask.description.toLowerCase() == task.description.toLowerCase()) {

        if (task._id && !addedTask._id) {
          taskToReplace = addedTask;
        }
        return false;
      }

      return true;
    });

    if (taskToReplace) {
      var index = filteredTasks.indexOf(taskToReplace);
      filteredTasks.splice(index, 1);

      notDuplicate = true;
    }

    if (notDuplicate) {

      filteredTasks.push(task);
    }

  });

  return filteredTasks;

}

module.exports = EventController;