'use strict';

var async = require('async');
var User = require('../models/user.model');
var Organizer = require('../models/organizer.model');
var Event = require('../models/event.model');
var Utils = require('../middleware/utils');

var utils = new Utils();

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
  eventObj.task = [];

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

    EventController.prototype.addTasksStub(newEvent, eventTasks, {
      sendMail: true,
      excludeManagers: [],
      excludeVolunteers: []
    }, res, function(err, updatedEvent, res) {

      EventController.prototype.getEventStub(newEvent._id, res);

    });

  });
}

EventController.prototype.addTasksStub = function(eventObj, newTasks, sendMail, res, callback) {

  var filteredTasks = EventController.prototype.filterTasks(newTasks);

  if (!filteredTasks || !filteredTasks.length) {

    if (callback) {
      callback(null, eventObj, res);
    } else {

      return eventObj;
    }
  } else {

    async.waterfall([

        function(done) {

          var validatedTasks = [];


          utils.syncLoop(filteredTasks.length, function(loop, processedTasks) {

              User.findById(filteredTasks[loop.iteration()].manager_ref, function(err, person) {

                if (person) {

                  Event.findOne({
                    _id: eventObj._id,
                    'tasks.manager_ref': person._id
                  }, function(err, duplicate) {

                    if (!err && !duplicate) {
                      processedTasks.push({
                        manager_ref: filteredTasks[loop.iteration()].manager_ref,
                        description: filteredTasks[loop.iteration()].description,
                        volunteers: []
                      });


                      //Filter volunteers
                      utils.syncLoop(filteredTasks[loop.iteration()].volunteers.length, function(innerLoop, processedVolunteers) {

                          User.findById(processedVolunteers[innerLoop.iteration()].volunteer_ref, function(err, person) {

                            if (person) {

                              Event.findOne({
                                _id: eventObj._id,
                                'tasks.volunteers.volunteer_ref': person._id
                              }, function(err, duplicate) {

                                if (!err & !duplicate) {

                                  processedVolunteers.push({
                                    volunteer_ref: person._id,
                                    schedules: processedVolunteers[innerLoop.iteration()].schedules
                                  });
                                  innerLoop.next();
                                } else {
                                  innerLoop.next();
                                }

                              });

                            } else {
                              innerLoop.next();
                            }

                          });
                        },
                        function() {
                          loop.next();
                        },
                        processedTasks[processedTasks.length].volunteers
                      );
                    }
                  });
                } else {
                  loop.next();
                }
              });

            },
            function(processedTasks) {

              done(null, processedTasks);
            },
            validatedTasks
          );

        },
        function(addedTasks, done) {

          if (!addedTasks.length) {
            done(null, null);
          } else {

            //Add validated users as Tasks

            addedTasks.forEach(function(eachTask) {

              eventObj.tasks.push(eachTask);

            });

            eventObj.save(function(err, saved) {

              if (err) {
                done(null, null);
              } else if (!sendMail) {

                done(null, saved);
              } else {

                //Send notification mail to all added Tasks
                Event.findOne({
                  _id: eventObj._id
                }).populate('tasks.manager_ref').exec(function(err, populatedEvent) {

                  if (err) {
                    done(null, null);
                  } else {

                    var mailOptions = {
                      to: '',
                      from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                      subject: 'You have been added to ' + populatedEvent.name + ' event.',
                      text: 'You have been added to ' + populatedEvent.name + ' event.',
                      html: 'Hello,\n\n' +
                        'You have been added as Task manager to <b>' + populatedEvent.name + '</b> event.\n'
                    };


                    utils.syncLoop(populatedEvent.tasks.length, function(loop, returnedEvent) {

                      if (sendMail.excludeStaff && sendMail.excludeStaff.length) {

                        var sendMailTo = sendMail.excludeStaff.every(function(everyOldTask) {

                          if (everyOldTask.manager_ref == populatedEvent.Tasks[loop.iteration()].manager_ref._id) {
                            return false;
                          }

                          return true;
                        });

                        if (sendMailTo) {
                          mailOptions.to = populatedEvent.tasks[loop.iteration()].manager_ref.email;

                          utils.sendMail(mailOptions);
                          loop.next();
                        } else {
                          loop.next();
                        }

                      } else {

                        mailOptions.to = populatedEvent.tasks[loop.iteration()].manager_ref.email;

                        utils.sendMail(mailOptions);
                        loop.next();

                      }

                    }, function(returnedEvent) {
                      done(null, returnedEvent)
                    }, populatedEvent);

                  }
                });
              }
            });
          }
        },
        function(done, eventData) {

          if (!eventData) {
            done(null, eventObj)
          } else if (!sendMail) {

            done(null, eventData);
          } else {

            //Send notification mail to all added volunteers
            Event.findOne({
              _id: eventObj._id
            }).populate('tasks.volunteers.volunteer_ref').exec(function(err, populatedEvent) {

              if (err) {
                done(null, eventData);
              } else {

                if (populatedEvent && populatedEvent.tasks && populatedEvent.tasks.length) {

                  var mailOptions = {
                    to: '',
                    from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                    subject: 'You have been added to ' + populatedEvent.name + ' event.',
                    text: 'You have been added to ' + populatedEvent.name + ' event.',
                    html: 'Hello,\n\n' +
                      'You have been added as volunteer to <b>' + populatedEvent.name + '</b> event.\n'
                  };


                  utils.syncLoop(populatedEvent.tasks.length, function(loop, returnedEvent) {

                    if (sendMail.excludeStaff && sendMail.excludeStaff.length) {

                      utils.syncLoop(populatedEvent.tasks[loop.iteration()].volunteers.length, function(innerLoop, processedVolunteers) {

                          var sendMailTo = sendMail.excludeVolunteers.every(function(everyVolunteer) {

                            if (everyVolunteer.volunteer_ref == processedVolunteers[innerLoop.iteration()].volunteer_ref._id) {
                              return false;
                            }

                            return true;
                          });

                          if (sendMailTo) {

                            mailOptions.to = processedVolunteers[innerLoop.iteration()].volunteer_ref.email;

                            utils.sendMail(mailOptions);
                            innerLoop.next();
                          } else {
                            innerLoop.next();
                          }
                        },
                        function() {
                          loop.next();
                        },
                        populatedEvent.tasks[loop.iteration()].volunteers);

                    } else {


                      utils.syncLoop(populatedEvent.tasks[loop.iteration()].volunteers.length, function(innerLoop, processedVolunteers) {

                          mailOptions.to = processedVolunteers[innerLoop.iteration()].volunteer_ref.email;

                          utils.sendMail(mailOptions);
                          innerLoop.next();
                        },
                        function() {
                          loop.next();
                        },
                        populatedEvent.tasks[loop.iteration()].volunteers);
                    }

                  }, function(returnedEvent) {
                    done(null, returnedEvent)
                  }, populatedEvent);

                } else {
                  done(null, eventData);
                }

              }
            });

          }
        }
      ],
      function(err, returnedTasks) {

        if (callback) {
          callback(err, returnedTasks, res);
        } else {
          if (err)
            return eventObj;

          return returnedTasks;
        }
      });
  }
}

EventController.prototype.getAllEvents = function(req, res) {

  Event.find(function(err, events) {
    if (err) {
      return res.json(err);
    }
    Event.populate(events, {
      path: 'user_ref task.manager_ref task.volunteers.volunteer_ref'
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

  Event.remove({
    _id: eventId
  }, function(err, evt) {
    if (err) return res.send(err);

    res.json({
      message: 'Succesfully deleted'
    });
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
          path: 'tasks.manager_ref'
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
          path: 'tasks.volunteers.volunteer_ref'
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

  if (!newTasks || !newTasks.length) {
    return null;
  }

  var uniqueTasks = [];

  newTasks.forEach(function(eachTask) {

    var notAdded = uniqueTasks.every(function(task) {

      if (eachTask.manager_ref == task.manager_ref || eachTask.description.toLowerCase() == task.description.toLowerCase()) {
        return false;
      }

      return true;
    });

    if (notAdded) {
      uniqueTasks.push(eachTask);
    }
  });

  var uniqueVolunteerTasks = JSON.parse(JSON.stringify(uniqueTasks));
  uniqueVolunteerTasks.forEach(function(eachTask) {
    eachTask.volunteers = [];
  });

  for (var x in uniqueTasks) {

    for (var y in uniqueTasks[x].volunteers) {
      var notAdded = uniqueVolunteerTasks[x].volunteers.every(function(volunteer) {

        if (volunteer.volunteer_ref == uniqueTasks[x].volunteers[y].volunteer_ref) {
          return false;
        }

        return true;
      });

      if (notAdded) {
        uniqueVolunteerTasks[x].volunteers.push(uniqueTasks[x].volunteers[y]);
      }
    }
  }

  console.log(uniqueVolunteerTasks);
  uniqueTasks = JSON.parse(JSON.stringify(uniqueVolunteerTasks));
  var duplicatedVolunteer;

  for (var x = 0; x < uniqueVolunteerTasks.length - 1; x++) {

    uniqueVolunteerTasks[i].volunteers.forEach(function(volunteer) {

      for (var y = x + 1; y < uniqueVolunteerTasks.length; y++) {

        var unique = uniqueTasks[x].volunteers.every(function(volunt) {

          if (volunt.volunteer_ref == uniqueVolunteerTasks[x].volunteers[y].volunteer_ref) {
            duplicatedVolunteer = volunt;
            return false;
          }
          return true;
        });

        if (!unique) {
          var index = uniqueTasks[x].indexOf(duplicatedVolunteer);
          uniqueTasks[x].splice(index, 1);
        }
      }
    });
  }

  return uniqueTasks;
}

module.exports = EventController;
