'use strict';

var asyncModule = require('async');
var Task = require('../models/task.model');
var User = require('../models/user.model');
var Event = require('../models/event.model');
var Utils = require('../middleware/utils');

var utils = new Utils();

var TaskController = function() {};

TaskController.prototype.addTask = function(req, res) {

  if (!req.body.newTask) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }
  var newTask = req.body.newTask;
  var eventId = req.params.event_id;
  var eventName;

  Task.findOne({
    event_ref: eventId,
    description: {
      $regex: new RegExp(newTask.description, "i")
    }
  }, function(err, task) {
    if (err) {
      return res.send(err);
    } else if (task) {
      return res.status(422).send({
        success: false,
        message: 'There is another event task with same description!'
      });
    } else {

      Event.findById(eventId, function(err, evt) {

        if (err) {
          return res.send(err);
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

          eventName = evt.name;
          if (!newTask.manager_ref) {

            return res.status(422).send({
              success: false,
              message: 'No manager id specified!'
            });

          } else {

            User.findById(newTask.manager_ref, function(err, user) {

              if (err) {
                return res.send(err);
              } else if (!user) {
                return res.status(422).send({
                  success: false,
                  message: 'Invalid manager id!'
                });
              } else {

                asyncModule.waterfall([function(done) {

                    TaskController.prototype.filterVolunteers(newTask.volunteers, done);

                  }, function(volunteers, done) {

                    newTask.volunteers = volunteers;

                    newTask.event_ref = eventId;

                    Task.create(newTask, function(err, savedTask) {

                      if (err) {
                        done(err)
                      } else {

                        done(null, savedTask);
                      }

                    });
                  }, function(savedTask, done) {
                    User.populate(savedTask, {
                      'path': 'manager_ref volunteers.volunteer_ref'
                    }, function(err, populatedTask) {

                      if (err) {
                        done({
                          success: false,
                          message: 'Error populating task details!'
                        });
                      } else {
                        var mailOptions = {};

                        mailOptions = {
                          to: populatedTask.manager_ref.email,
                          from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                          subject: 'You have been added to ' + eventName + ' event.',
                          text: 'You have been added to ' + eventName + ' event.',
                          html: 'Hello,\n\n' +
                            'You have been added as Task manager to <b>' + eventName + '</b> event.\n'
                        };

                        utils.sendMail(mailOptions);

                        mailOptions.to = '';
                        mailOptions.html = 'Hello,\n\n' +
                          'You have been added as volunteer to <b>' + eventName + '</b> event.\n'

                        utils.syncLoop(populatedTask.volunteers.length, function(loop, taskToMail) {

                          mailOptions.to = taskToMail.volunteers[loop.iteration()].volunteer_ref.email;

                          utils.sendMail(mailOptions);
                          loop.next();

                        }, function(returnedTask) {
                          done(null, returnedTask)
                        }, populatedTask);
                      }

                    });
                  }],
                  function(err, createdTask) {
                    if (err) {
                      return res.status(422).send(err);
                    } else {
                      if (!createdTask) {
                        return res.status(422).send({
                          success: false,
                          message: 'Error creating task!'
                        });
                      }

                      res.json(createdTask);
                    }
                  });
              }
            });
          }
        }
      });
    }
  });
}

TaskController.prototype.editTask = function(req, res) {

  if (!req.body.newTask) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }

  var eventId = req.params.event_id;
  var taskId = req.params.task_id;
  var newTask = req.body.newTask;
  var eventName;
  var oldVlnteers;


  Task.findOne({
    event_ref: eventId,
    _id: {
      $ne: taskId
    },
    description: {
      $regex: new RegExp(newTask.description, "i")
    }
  }, function(err, task) {
    if (err) {
      return res.send(err);
    } else if (task) {
      return res.status(422).send({
        success: false,
        message: 'There is another event task with same description!'
      });
    } else {

      Event.findById(eventId, function(err, evt) {

        if (err) {
          return res.send(err);
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

          if (!newTask.manager_ref) {

            return res.status(422).send({
              success: false,
              message: 'No manager id specified!'
            });

          } else {

            eventName = evt.name;
            User.findById(newTask.manager_ref, function(err, user) {

              if (err) {
                return res.send(err);
              } else if (!user) {
                return res.status(422).send({
                  success: false,
                  message: 'Invalid manager id!'
                });
              } else {

                Task.findById(taskId, function(err, task) {

                  if (err) {
                    return res.send(err);
                  } else if (!task) {
                    return res.status(422).send({
                      success: false,
                      message: 'Invalid task id!'
                    });
                  } else {


                    oldVlnteers = task.volunteers;
                    newTask.event_ref = eventId;

                    asyncModule.waterfall([function(done) {

                        TaskController.prototype.filterVolunteers(newTask.volunteers, done);

                      }, function(volunteers, done) {

                        newTask.volunteers = volunteers;
                        newTask.event_ref = eventId;

                        Task.findByIdAndUpdate(newTask._id, newTask, {
                          'new': true
                        }, function(err, updatedTask) {

                          if (err) {
                            done(err)
                          } else if (!updatedTask) {
                            done({
                              success: false,
                              message: 'Could not update!'
                            });
                          } else {
                            done(null, updatedTask);
                          }
                        });
                      }, function(savedTask, done) {
                        User.populate(savedTask, {
                          'path': 'volunteers.volunteer_ref'
                        }, function(err, populatedTask) {

                          if (err) {
                            done({
                              success: false,
                              message: 'Error populating task details!'
                            });
                          } else {
                            var mailOptions = {};

                            mailOptions = {
                              to: '',
                              from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                              subject: 'You have been added to ' + populatedTask.event_ref.name + ' event.',
                              text: 'You have been added to ' + populatedTask.event_ref.name + ' event.',
                              html: 'Hello,\n\n' +
                                'You have been added as volunteer to <b>' + populatedTask.event_ref.name + '</b> event.\n'
                            };

                            utils.syncLoop(populatedTask.length, function(loop, taskToMail) {

                              if (oldVlnteers && oldVlnteers.length) {

                                var oldVlnteerIndex;

                                var sendMailTo = oldVlnteers.every(function(vlnteer) {

                                  if (vlnteer._id == taskToMail[loop.iteration()].volunteers.volunteer_ref) {
                                    oldVlnteerIndex = taskToMail[loop.iteration()].volunteers.indexOf(vlnteer);
                                    return false;
                                  }

                                  return true;
                                });

                                if (sendMailTo) {

                                  mailOptions.to = taskToMail.volunteers[loop.iteration()].volunteer_ref.email;

                                  utils.sendMail(mailOptions);
                                  oldVlnteers.splice(oldVlnteerIndex, 1);
                                  loop.next();
                                } else {
                                  loop.next();
                                }

                              } else {

                                mailOptions.to = taskToMail.volunteers[loop.iteration()].volunteer_ref.email;

                                utils.sendMail(mailOptions);
                                loop.next();
                              }
                            }, function(returnedTask) {
                              done(null, returnedTask)
                            }, populatedTask);
                          }

                        });
                      }],
                      function(err, editedTask) {

                        if (err) {
                          return res.status(422).send(err);
                        } else {
                          if (!editedTask) {
                            return res.status(422).send({
                              success: false,
                              message: 'Error editing task!'
                            });
                          }

                          res.json(editedTask);
                        }
                      });
                  }
                });
              }
            });
          }
        }
      });
    }
  });
}

TaskController.prototype.getTask = function(req, res) {

  var taskId = req.params.task_id;

  Task.findById(taskId, function(err, task) {

    if (err) {

      return res.send(err);
    } else if (!task) {

      return res.status(422).send({
        success: false,
        message: 'Invalid Task id'
      });
    } else {

      User.populate(task, {
        'path': 'volunteers.volunteer_ref'
      },function(err, populatedTask) {

        if (err || !populatedTask) {
          done({
            success: false,
            message: 'Error populating task details!'
          });
        } else {
          res.json(populatedTask);
        }

      });
    }
  });
}

TaskController.prototype.deleteTask = function(req, res) {

  var taskId = req.params.task_id;
  var eventId = req.params.event_id;

  Event.findById(eventId, function(err, evt) {

    if (err) {
      return res.send(err);
    } else if (!evt) {
      return res.status(422).send({
        success: false,
        message: 'Attached Event not found!'
      });
    } else if (evt.user_ref != req.decoded._id) {

      return res.status(401).send({
        success: false,
        message: 'Unauthorized!'
      });
    } else {

      Event.findByIdAndUpdate(eventId, {
        $pull: {
          tasks: {
            task_ref: taskId
          }
        }
      }, function(err, evt) {

        if (err) {

          res.send(err);

        } else {

          Task.remove({
            _id: taskId
          }, function(err) {

            if (err) {
              return res.status(422).send({
                success: false,
                message: 'Error deleting task!'
              });
            } else {

              return res.json({
                success: true,
                message: 'Succesfully deleted'
              });
            }
          });
        }
      });
    }
  });
}

TaskController.prototype.getEventTasks = function(req, res) {

  var eventId = req.params.event_id;

  Task.find({
    event_ref: eventId
  }, function(err, tasks) {

    if (err) {

      return res.send(err);
    } else if (!tasks) {

      return res.status(422).send({
        success: false,
        message: 'No tasks found!'
      });
    } else {

      User.populate(tasks, {
        path: 'manager_ref volunteers.volunteer_ref'
      }, function(err1, tasks1) {

        if (err) {
          res.send(err);
        } else {
          res.json(tasks1);
        }
      });
    }
  });
}

TaskController.prototype.filterVolunteers = function(volunteers, done) {

  volunteers = volunteers || [];

  var uniqueVolunteers = [];

  volunteers.forEach(function(volunteer) {

    var notAdded = uniqueVolunteers.every(function(addedVlnteer) {

      if (volunteer.volunteer_ref === addedVlnteer.volunteer_ref) {
        return false;
      }

      return true;
    });

    if (notAdded) {
      uniqueVolunteers.push(volunteer);
    }
  });

  var validatedVlnteers = [];

  utils.syncLoop(uniqueVolunteers.length, function(loop, vlnteers) {

    User.findById(uniqueVolunteers[loop.iteration()].volunteer_ref, function(err, user) {

      if (err || !user) {
        loop.next();
      } else {
        validatedVlnteers.push(uniqueVolunteers[loop.iteration()]);
        loop.next();
      }
    });

  }, function(returnedVlnteers) {
    if (done) {

      done(null, returnedVlnteers);
    } else {
      return returnedVlnteers;
    }
  }, validatedVlnteers);

}

module.exports = TaskController;
