'use strict';

var Promise = require('promise');
var User = require('../models/user.model');
var Event = require('../models/event.model');
var Task = require('../models/task.model');
var Utils = require('../middleware/utils');
var configCloud = require('../../config/config');
var cloudinary = require('cloudinary');
var formidable = require('formidable');
var mongoose = require('mongoose');

var Event = mongoose.model('Event');
var utils = new Utils();

var EventController = function() {};

cloudinary.config({
  cloud_name: 'dev8nation',
  api_key: 687213232223225,
  api_secret: 'kqQ5ebJHMcZuJSLS4cpgdK8tFNY'
});

EventController.prototype.registerEvent = function(req, res) {
  var eventDetails = new Event(req.body);

  eventDetails.save(req.body, function(err, eventDetails){
    if(err) {
      return res.json(err);
    }
    return res.json(eventDetails);
  });
};


EventController.prototype.imageProcessing = function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, file) {
    req.body = fields;
      if(Object.keys(file) != 0){
      cloudinary.uploader.upload(file.file.path, function(result){
        req.body.imageUrl = result.secure_url;
        next();
      }, {
        width: 800,
        height: 800
      });
    } else {next();}
    });
};


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
    //Send mail to event manager
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

  if (!req.body) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }

  var eventObj = req.body;
  var eventId = req.body._id;

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
          imageUrl: eventObj.imageUrl,
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

//Set event in draft state to published state
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
      //Publish event
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
              //Populate the user_ref property of the events' model
              //with the matching user details from the user model
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

//Add an event to your event drafts
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
          //Populate the user_ref property of the events' model
          //with the matching user details from the user model
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

//Get all events that are published
EventController.prototype.getAllEvents = function(req, res) {

  Event.find({
    online: true
  }, function(err, events) {
    if (err) {
      return res.json(err);
    }

    //Populate the user_ref and manager_ref properties of the events' model
    //with the matching user details from the user model
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

//Delete an event by id
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

//Get an event by id
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

//Get list of your published events
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

//Get your drafted events that are not yet published
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

//Reuse a published event
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

      var newEvent = utils.convertToObject(evt);

      if (!newEvent) {

        return res.status(422).send({
          success: false,
          message: 'Unable to parse event object!'
        });
      }

      //Delete the id property before saving as new object in db
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

              //Copy list of the task managers added to the previous event
              //to the newly created event using Promise instance 

              var promiseObject = function(curIndex) {

                return new Promise(function(resolve) {

                  var task = utils.convertToObject(tasks[curIndex]);

                  if (task) {

                    //Delete the id property before saving as new object in db
                    delete task._id;
                    task.volunteers = [];
                    task.completed = false;
                    task.event_ref = clonedEventId;

                    task = new Task(task);
                    task.save(function(err) {

                      resolve(curIndex);

                    });
                  } else {
                    resolve(curIndex);
                  }

                });
              }

              //Executes recursively to loop through all the task objects

              var promiseObjectLoop = function(curIndex) {


                if (curIndex < tasks.length) {

                  promiseObject(curIndex).then(function(prevIndex) {

                    promiseObjectLoop(prevIndex + 1);
                  });

                } else {

                  //Return created events after all task objects have been duplicated
                  Event.findById(clonedEventId, function(err, evt) {

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
                }

              }

              promiseObjectLoop(0);

            }
          });
        }
      });
    }
  });
}

module.exports = EventController;