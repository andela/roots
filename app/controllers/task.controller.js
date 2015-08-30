'use strict';

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
  var managerEmail;

  Task.findOne({
    event_ref: eventId,
    description: {
      $regex: new RegExp(newTask.description, "i")
    }
  }, function(err, task) {
    if (err) {
      return res.status(500).send(err);
    } else if (task) {
      return res.status(422).send({
        success: false,
        message: 'There is another event task with same description!'
      });
    } else {

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

          eventName = evt.name;
          if (!newTask.manager_ref) {

            return res.status(422).send({
              success: false,
              message: 'No manager id specified!'
            });

          } else {

            User.findById(newTask.manager_ref, function(err, user) {

              if (err) {
                return res.status(500).send(err);
              } else if (!user) {
                return res.status(422).send({
                  success: false,
                  message: 'Invalid manager id!'
                });
              } else {
                managerEmail = user.email;
                newTask.volunteers = [];
                newTask.event_ref = eventId;

                Task.create(newTask, function(err, createdTask) {

                  if (err) {
                    return res.status(422).send(err);
                  } else if (!createdTask) {
                    return res.status(422).send({
                      success: false,
                      message: 'Error creating task!'
                    });
                  } else {

                    var mailOptions = {
                      to: managerEmail,
                      from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                      subject: 'You have been added to ' + eventName + ' event.',
                      text: 'You have been added to ' + eventName + ' event.',
                      html: 'Hello,\n\n' +
                        'You have been added as <b>' + createdTask.description + '</b> task manager of <b>' + eventName + '</b> event.\n'
                    };

                    utils.sendMail(mailOptions);
                    User.populate(createdTask, {
                      'path': 'manager_ref'
                    }, function(err, populatedTask) {

                      if (err) {
                        res.status(500).send({
                          success: false,
                          message: 'Task created, but error occured fetching it from db'
                        });
                      } else {

                        res.json(populatedTask);
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
  var newManagerEmail;
  var prevManagerId;

  Task.findOne({
    event_ref: eventId,
    _id: {
      '$ne': taskId
    },
    description: {
      $regex: new RegExp(newTask.description, "i")
    }
  }, function(err, task) {
    if (err) {
      return res.status(500).send(err);
    } else if (task) {
      return res.status(422).send({
        success: false,
        message: 'There is another event task with same description!'
      });
    } else {

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

          if (!newTask.manager_ref) {

            return res.status(422).send({
              success: false,
              message: 'No manager id specified!'
            });

          } else {

            eventName = evt.name;
            User.findById(newTask.manager_ref, function(err, user) {

              if (err) {
                return res.status(500).send(err);
              } else if (!user) {
                return res.status(422).send({
                  success: false,
                  message: 'Invalid manager id!'
                });
              } else {
                newManagerEmail = user.email;

                Task.findById(taskId, function(err, task) {
                  prevManagerId = task.manager_ref;
                  if (err) {
                    return res.status(500).send(err);
                  } else if (!task) {
                    return res.status(422).send({
                      success: false,
                      message: 'Invalid task id!'
                    });
                  } else {

                    Task.findByIdAndUpdate(taskId, {
                      $set: {
                        event_ref: eventId,
                        manager_ref: newTask.manager_ref,
                        description: newTask.description,
                        startDate: newTask.startDate,
                        endDate: newTask.endDate
                      }
                    }, {
                      'new': true
                    }, function(err, updatedTask) {

                      if (err) {
                        return res.status(500).send(err);
                      } else if (!updatedTask) {
                        return res.status(422).send({
                          success: false,
                          message: 'Error editing task!'
                        });
                      } else {

                        if (prevManagerId.toString() !== updatedTask.manager_ref.toString()) {

                          var mailOptions = {
                            to: newManagerEmail,
                            from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                            subject: 'You have been added to ' + eventName + ' event.',
                            text: 'You have been added to ' + eventName + ' event.',
                            html: 'Hello,\n\n' +
                              'You have been added as <b>' + updatedTask.description + '</b> task manager of <b>' + eventName + '</b> event.\n'
                          };

                          utils.sendMail(mailOptions);
                        }

                        User.populate(updatedTask, {
                          'path': 'manager_ref'
                        }, function(err, populatedTask) {

                          if (err) {
                            res.status(500).send({
                              success: false,
                              message: 'Task edited, but error occured fetching it from db'
                            });
                          } else {

                            res.json(populatedTask);
                          }
                        });
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
  var eventId = req.params.event_id;

  Task.findOne({
    _id: taskId,
    event_ref: eventId
  }, function(err, task) {

    if (err) {

      return res.status(500).send(err);
    } else if (!task) {

      return res.status(422).send({
        success: false,
        message: 'Invalid Task or Event id'
      });
    } else {

      User.populate(task, {
        'path': 'manager_ref volunteers.volunteer_ref'
      }, function(err, populatedTask) {

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
      return res.status(500).send(err);
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

          res.status(500).send(err);

        } else {

          Task.remove({
            _id: taskId,
            event_ref: eventId
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

      return res.status(500).send(err);
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
          res.status(500).send(err);
        } else {
          res.json(tasks1);
        }
      });
    }
  });
}

TaskController.prototype.addVolunteer = function(req, res) {

  var taskId = req.params.task_id;
  var volunteerId = req.body.volunteerId;
  var volunteerEmail;
  var eventName;

  if (!volunteerId) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }

  User.findById(volunteerId, function(err, user) {

    if (err) {
      return res.send(err)
    } else {

      if (!user) {
        return res.status(422).send({
          success: false,
          message: 'Invalid volunteer id!'
        });
      } else {

        volunteerEmail = user.email;
        Task.findById(taskId, function(err, task) {

          if (err) {
            return res.send(err)
          } else {

            if (!task) {
              return res.status(422).send({
                success: false,
                message: 'Invalid task id!'
              });
            } else {

              Event.findById(task.event_ref, function(err, evt) {

                if (err || !evt) {
                  return res.status(422).send({
                    success: false,
                    message: 'Error retrieving task event!'
                  });
                } else {

                  eventName = evt.name;


                  var volunteers = task.volunteers;

                  var notAdded = volunteers.every(function(volunteer) {

                    if (volunteer.volunteer_ref.toString() === volunteerId) {
                      return false;
                    }

                    return true;
                  });

                  if (!notAdded) {

                    return res.status(422).send({
                      success: false,
                      message: 'User has been added before!'
                    });
                  } else {

                    Task.findByIdAndUpdate(taskId, {
                      $push: {
                        'volunteers': {
                          'volunteer_ref': volunteerId
                        }
                      }
                    }, function(err, updatedTask) {

                      if (err) {
                        return res.send(err)
                      } else {

                        if (!updatedTask) {
                          return res.status(422).send({
                            success: false,
                            message: 'Could not add volunteer!'
                          });
                        } else {

                          var mailOptions = {
                            to: volunteerEmail,
                            from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                            subject: 'You have been added to ' + eventName + ' event.',
                            text: 'You have been added to ' + eventName + ' event.',
                            html: 'Hello,\n\n' +
                              'You have been added as volunteer to <b>' + eventName + '</b> event.\n'
                          };

                          utils.sendMail(mailOptions);

                          Task.findById(taskId, {
                            volunteers: {
                              $elemMatch: {
                                volunteer_ref: volunteerId
                              }
                            }
                          }, function(err, volunteer) {
                            if (err || !volunteer) {
                              return res.status(422).send({
                                success: false,
                                message: 'Volunteer added, but unable to retrieve record!'
                              });
                            } else {

                              res.json(volunteer.volunteers[0]);
                            }

                          });
                        }
                      }
                    });

                  }
                }
              });
            }
          }
        });
      }
    }
  });
}

TaskController.prototype.removeVolunteer = function(req, res) {

  var taskId = req.params.task_id;
  var volunteerId = req.params.volunteer_id;

  Task.findById(taskId, function(err, task) {

    if (err) {
      return res.send(err)
    } else {

      if (!task) {
        return res.status(422).send({
          success: false,
          message: 'Invalid task id!'
        });
      } else {

        Task.findByIdAndUpdate(taskId, {
          $pull: {
            'volunteers': {
              'volunteer_ref': volunteerId
            }
          }
        }, function(err, updatedTask) {

          if (err) {
            return res.status(500).send(err);
          } else {

            if (!updatedTask) {
              return res.status(422).send({
                success: false,
                message: 'Could not remove volunteer!'
              });
            } else {
              res.json({
                success: true,
                message: 'Volunteer removed!'
              });
            }
          }
        });
      }
    }
  });
}

TaskController.prototype.addSchedule = function(req, res) {

  var taskId = req.params.task_id;
  var schedulesId = req.params.schds_id;
  var newSchedule = req.body.newSchedule;

  if (!newSchedule) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  } else {

    Task.findById(taskId, {
      volunteers: {
        $elemMatch: {
          _id: schedulesId
        }
      }
    }, function(err, volunteer) {

      if (err || !volunteer || !volunteer.volunteers.length) {
        return res.status(422).send({
          success: false,
          message: 'Unable to retrieve volunteer schedule record!'
        });
      } else {

        var prevVolunteerSchedules = volunteer.volunteers[0].schedules;

        Task.findOneAndUpdate({
          'volunteers._id': schedulesId
        }, {
          '$push': {
            'volunteers.$.schedules': newSchedule
          }
        }, function(err, task) {

          if (err) {
            return res.status(500).send(err);
          } else if (!task) {

            return res.status(422).send({
              success: false,
              message: 'Could not add schedule!'
            });
          } else {


            Task.findById(taskId, {
              volunteers: {
                $elemMatch: {
                  _id: schedulesId
                }
              }
            }, function(err, volunteer) {
              if (err || !volunteer) {
                return res.status(422).send({
                  success: false,
                  message: 'Schedule added, but unable to retrieve record!'
                });
              } else {

                var newVolunteerSchedules = volunteer.volunteers[0].schedules;

                prevVolunteerSchedules.forEach(function(prevSchedule) {

                  var prevSchdl;

                  var notNewSchedule = newVolunteerSchedules.every(function(schedule) {

                    if (prevSchedule._id === schedule._id) {

                      prevSchdl = schedule._id;
                      return false;
                    }

                    return true;
                  });

                  if (!notNewSchedule) {
                    var index = newVolunteerSchedules.indexOf(prevSchdl);
                    newVolunteerSchedules.splice(index, 1);
                  }

                });

                res.json(newVolunteerSchedules[0]);
              }

            });
          }

        });
      }

    });
  }
}

TaskController.prototype.editSchedule = function(req, res) {

  var taskId = req.params.task_id;
  var scheduleId = req.params.schd_id;
  var newSchedule = req.body.newSchedule;

  if (!newSchedule) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  } else {

    Task.findOneAndUpdate({
      _id: taskId,
      'volunteers.schedules._id': scheduleId
    }, {
      '$set': {
        'volunteers.0.schedules.$.description': newSchedule.description,
        'volunteers.0.schedules.$.startDate': newSchedule.startDate,
        'volunteers.0.schedules.$.endDate': newSchedule.endDate,
        'volunteers.0.schedules.$.completed': newSchedule.completed
      }
    }, function(err, task) {

      if (err) {
        return res.status(500).send(err);
      } else if (!task) {

        return res.status(422).send({
          success: false,
          message: 'Could not edit schedule!'
        });
      } else {

        res.json({
          success: true,
          message: 'Schedule edited succesfully!'
        });
      }
    });
  }
}

TaskController.prototype.getTaskVolunteers = function(req, res) {

  var taskId = req.params.task_id;

  Task.findById(taskId, function(err, task) {

    if (err) {
      return res.status(500).send(err);
    } else if (!task) {

      return res.status(422).send({
        success: false,
        message: 'No task found!'
      });
    } else {

      if (!task.length) {
        User.populate(task, {
          path: 'volunteers.volunteer_ref'
        }, function(err1, tasks1) {

          if (err) {
            res.status(500).send(err);
          } else {
            res.json(tasks1.volunteers);
          }
        });
      } else {
        res.json([]);
      }

    }
  });
}

module.exports = TaskController;
