'use strict';

var async = require('async');
var Task = require('../models/task.model');
var User = require('../models/user.model');
var Event = require('../models/event.model');
var Utils = require('../middleware/utils');

var utils = new Utils();

var TaskController = function() {};

TaskController.prototype.addOrEditTask = function(req, res) {

  if (!req.body.newTask) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }

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

      async.waterfall([function(done) {

        TaskController.prototype.addTaskStub(eventId, req.body.newTask, done);

      }], function(err, returnedData) {

        if (err) {
          return res.status(422).send(err);
        } else {
          if (!returnedData._id) {
            return res.status(422).send(returnedData);
          }
        }

        TaskController.prototype.getTaskStub(returnedData._id, res);
      });

    }
  });
}

TaskController.prototype.getTask = function(req, res) {

  var taskId = req.params.task_id;

  TaskController.prototype.getTaskStub(taskId, res);

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

      TaskController.prototype.deleteTaskStub(eventId, taskId, res);
    }
  });
}

TaskController.prototype.addOrEditTaskStub = function(eventId, newTask, exit, loop) {

  Event.findById(eventId, function(err, evt) {

    if (err || !evt) {

      if (loop) {
        loop.next();
      } else {

        if (err) {
          if (exit) {
            exit(err);
          } else {
            return null;
          }

        } else {

          if (exit) {
            exit({
              success: false,
              message: 'Invalid event id'
            });
          } else {
            return ({
              success: false,
              message: 'Invalid event id'
            });
          }
        }
      }

    } else {

      var oldVlnteers;
      var update;

      async.waterfall([function(done) {

            var managerId = newTask.manager_ref._id || newTask.manager_ref;

            Task.findOne({
              $and: [{
                event_ref: eventId
              }, {
                _id: {
                  $ne: newTask._id
                }
              }, {
                $or: [{
                  manager_ref: managerId
                }, {
                  description: {
                    $regex: new RegExp(newTask.description, "i")
                  }
                }]
              }]
            }, function(err, task) {
              if (err) {
                done(err);
              } else if (task) {
                done({
                  success: false,
                  message: 'duplicate check failed!'
                });
              } else {
                TaskController.prototype.filterVolunteers(newTask.volunteers, done);
              }
            });

          }, function(volunteers, done) {

            newTask.volunteers = volunteers;

            Task.findById(newTask._id, function(err, task) {

              if (err) {
                done(err);
              } else if (!task || (task && !newTask._id)) {

                newTask.event_ref = eventId;

                Task.create(newTask, function(err, savedTask) {

                  if (err) {
                    done(err)
                  } else {

                    done(null, savedTask);
                  }

                });

              } else {

                oldVlnteers = task.volunteers;
                newTask.event_ref = eventId;
                update = true;
                Task.findByIdAndUpdate(newTask._id, newTask, {
                  'new': true,
                  'upsert': true
                }, function(err, updatedTask) {

                  if (err) {
                    done(err)
                  } else {
                    done(null, updatedTask);
                  }
                });
              }

            });

          },
          function(savedTask, done) {
            Task.findById(savedTask._id).populate('manager_ref event_ref volunteers.volunteer_ref').exec(function(err, populatedTask) {

              if (err) {
                done(savedTask)
              } else {
                var mailOptions = {};

                if (!update) {

                  mailOptions = {
                    to: populatedTask.manager_ref.email,
                    from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                    subject: 'You have been added to ' + populatedTask.event_ref.name + ' event.',
                    text: 'You have been added to ' + populatedTask.event_ref.name + ' event.',
                    html: 'Hello,\n\n' +
                      'You have been added as Task manager to <b>' + populatedTask.event_ref.name + '</b> event.\n'
                  };

                  utils.sendMail(mailOptions);
                }

                mailOptions = {
                  to: '',
                  from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                  subject: 'You have been added to ' + populatedTask.event_ref.name + ' event.',
                  text: 'You have been added to ' + populatedTask.event_ref.name + ' event.',
                  html: 'Hello,\n\n' +
                    'You have been added as volunteer to <b>' + populatedTask.event_ref.name + '</b> event.\n'
                };

                utils.syncLoop(populatedTask.length, function(loop, taskToMail) {

                  if (oldVlnteers) {

                    var oldVlnteerIndex;

                    var sendMailTo = oldVlnteers.every(function(vlnteer) {

                      if (vlnteer._id == taskToMail[loop.iteration()].volunteers.volunteer_ref) {
                        oldVlnteerIndex = taskToMail[loop.iteration()].volunteers.indexOf(vlnteer);
                        return false;
                      }

                      return true;
                    });

                    if (sendMailTo) {

                      mailOptions.to = taskToMail[loop.iteration()].volunteers.volunteer_ref.email;

                      utils.sendMail(mailOptions);
                      oldVlnteers.splice(oldVlnteerIndex, 1);
                      loop.next();
                    } else {
                      loop.next();
                    }

                  } else {

                    mailOptions.to = taskToMail[loop.iteration()].volunteers.volunteer_ref.email;

                    utils.sendMail(mailOptions);
                    loop.next();
                  }
                }, function(returnedTask) {
                  done(null, returnedTask)
                }, populatedTask);
              }

            });
          }
        ],

        function(err, returnedTask) {

          if (err) {

            if (loop) {
              loop.next();
            } else if (exit) {
              exit(err, null);
            } else {
              return err;
            }
          } else {

            utils.syncLoop(returnedTask.volunteers.length, function(outerLoop, loopTask) {

              Task.update({
                _id: {
                  $ne: loopTask._id
                },
                event_ref: loopTask.event_ref._id,
                'volunteers.volunteer_ref': loopTask.volunteers[outerLoop.iteration()].volunteer_ref._id
              }, {
                $pull: {
                  'volunteers': {
                    volunteer_ref: loopTask.volunteers[outerLoop.iteration()].volunteer_ref._id
                  }
                }
              }, function(err) {
                outerLoop.next();
              });

            }, function(task) {

              if (!update) {

                Event.findByIdAndUpdate(eventId, {
                  $push: {
                    'tasks': {
                      task_ref: returnedTask._id
                    }
                  }
                }, function(err, evt) {

                  if (loop) {
                    loop.next();
                  } else if (exit) {
                    exit(null, returnedTask);
                  } else {
                    return returnedTask;
                  }

                });

              } else {

                if (loop) {
                  loop.next();
                } else if (exit) {
                  exit(null, returnedTask);
                } else {
                  return returnedTask;
                }
              }
            }, returnedTask);

          }

        });
    }
  });
}


TaskController.prototype.getTaskStub = function(taskId, res) {

  async.waterfall([

    function(done) {

      Task.findById(taskId, function(err, task) {

        if (err) {
          if (res) {
            return res.send(err);
          } else {
            return null;
          }

        } else if (!task) {

          if (res) {
            return res.status(422).send({
              success: false,
              message: 'Invalid Task id'
            });
          } else {
            return null;
          }
        } else {

          Task.populate(task, {
            path: 'event_ref'
          }, function(err1, task1) {

            if (err) {
              done(err);
            } else {
              utils.syncLoop(task1.volunteers.length, function(loop, task) {

                User.populate(task.volunteers[loop.iteration()], {
                  'path': 'volunteer_ref'
                });

              }, function(task) {
                done(null, task);
              }, task1);
            }
          });
        }
      });
    }
  ], function(err, task) {

    if (err) {
      if (res) {
        return res.send(err);
      } else {
        return null;
      }
    }

    if (res) {
      res.json(task);
    } else {
      return task;
    }

  });
}

TaskController.prototype.deleteTaskStub = function(eventId, taskId, res, loop) {

  Event.findByIdAndUpdate(eventId, {
    $pull: {
      tasks: {
        task_ref: taskId
      }
    }
  }, function(err, evt) {

    if (err || !evt) {

      if (loop) {
        loop.next();
      } else {

        if (err) {
          if (res) {
            res.send(err);
          } else {
            return null;
          }

        } else {

          if (res) {
            return res.status(422).send({
              success: false,
              message: 'Invalid event id!'
            });
          } else {
            return ({
              success: false,
              message: 'Invalid event id'
            });
          }
        }
      }

    } else {

      Task.remove({
        _id: taskId
      }, function(err) {

        if (loop) {
          loop.next();
        } else if (err) {

          if (res) {
            return res.status(422).send({
              success: false,
              message: 'Error deleting task!'
            });
          } else {
            return ({
              success: false,
              message: 'Error deleting task'
            });
          }
        } else {
          if (res) {
            return res.json({
              success: true,
              message: 'Succesfully deleted'
            })
          } else {
            return ({
              message: 'Succesfully deleted'
            });
          }
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

      if (volunteer.volunteer_ref == addedVlnteer.volunteer_ref) {
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
