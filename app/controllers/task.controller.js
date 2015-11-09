'use strict';

var Task = require('../models/task.model');
var User = require('../models/user.model');
var Event = require('../models/event.model');
var Volunteer = require('../models/volunteer.model');
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

  //Check if there isn't any event task with same description
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

      //Retrieve event details
      Event.findById(eventId, function(err, evt) {

        if (err) {
          return res.status(500).send(err);
        } else if (!evt) {
          return res.status(422).send({
            success: false,
            message: 'Event not found!'
          });

          //Check if task is being added by the user that created the event
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

            //Fetch event manager details
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

                //Create new task with the newTask object
                Task.create(newTask, function(err, createdTask) {

                  if (err) {
                    return res.status(422).send(err);
                  } else if (!createdTask) {
                    return res.status(422).send({
                      success: false,
                      message: 'Error creating task!'
                    });
                  } else {

                    //Send notification to event manager
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

  //Check if there is no other event task with the same description
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

      //Fetch event details
      Event.findById(eventId, function(err, evt) {

        if (err) {
          return res.status(500).send(err);
        } else if (!evt) {
          return res.status(422).send({
            success: false,
            message: 'Event not found!'
          });
          //Check if task is being added by the user that created the event
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
            //Fetch event manager details
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

                    //Update task with the newTask object
                    Task.findByIdAndUpdate(taskId, {
                      $set: {
                        event_ref: eventId,
                        manager_ref: newTask.manager_ref,
                        description: newTask.description,
                        completed: newTask.completed,
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

                        //If there is a change in task manager
                        //sen notification to new task manager
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
                        //Populate manager_ref property of task object
                        //with matching details from user profile
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
      //Populate event_ref property of task object
      //with matching details from event object
      Event.populate(task, {
        'path': 'event_ref'
      }, function(err, eventPopulatedTask) {

        if (err || !eventPopulatedTask) {
          return res.status(422).send({
            success: false,
            message: 'Error populating task details!'
          });
        } else {
          //Populate volunteer_ref property of task object
          //with matching details from volunteer profile
          Volunteer.populate(eventPopulatedTask, {
            'path': 'volunteers.volunteer_ref'
          }, function(err, populatedTask) {

            if (err || !populatedTask) {
              return res.status(422).send({
                success: false,
                message: 'Error populating task details!'
              });
            } else {
              //Populate manager_ref property of task object
              //with matching details from user profile
              User.populate(populatedTask, {
                'path': 'manager_ref volunteers.volunteer_ref.user_ref'
              }, function(err, taskDetailed) {

                if (err || !taskDetailed) {
                  return res.status(422).send({
                    success: false,
                    message: 'Error populating task details!'
                  });
                } else {
                  res.json(taskDetailed);
                }
              });
            }
          });
        }
      });
    }
  });
}

TaskController.prototype.deleteTask = function(req, res) {

  var taskId = req.params.task_id;
  var eventId = req.params.event_id;

  //Fetch event details
  Event.findById(eventId, function(err, evt) {

    if (err) {
      return res.status(500).send(err);
    } else if (!evt) {
      return res.status(422).send({
        success: false,
        message: 'Attached Event not found!'
      });
      //Check if the user deleting the event 
      //created the event
    } else if (evt.user_ref != req.decoded._id) {

      return res.status(401).send({
        success: false,
        message: 'Unauthorized!'
      });
    } else {
      //Validate task id
      Task.findById(taskId, function(err, task) {
        if (err) {
          return res.status(500).send(err);
        } else if (!task) {
          return res.status(422).send({
            success: false,
            message: 'Task not found!'
          });
        } else {
          //Remove task_ref from event object
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

              Volunteer.remove({
                task_ref: taskId
              }, function(err) {

                if (err) {
                  return res.status(500).send(err);
                } else {
                  //Delete task
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

      });
    }
  });
}

//Get tasks that are created for an event
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
        path: 'manager_ref volunteers.user_ref'
      }, function(err1, tasks1) {

        if (err) {
          res.status(500).send(err);
        } else {

          //Populate volunteer_ref property of task object
          //with matching details from volunteer profile
          Volunteer.populate(tasks1, {
            'path': 'volunteers.volunteer_ref'
          }, function(err, populatedTask) {

            if (err || !populatedTask) {
              return res.status(422).send({
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
  });
}


//Get all tasks managed by a user
TaskController.prototype.getAllManagedTasks = function(req, res) {

  var userId = req.decoded._id;

  Task.find({
    manager_ref: userId
  }, function(err, tasks) {

    if (err) {

      return res.status(500).send(err);
    } else if (!tasks) {

      return res.json([]);
    } else {

      Event.populate(tasks, {
        path: 'event_ref'
      }, function(err1, tasks1) {

        if (err1) {
          res.status(500).send(err1);
        } else {

          return res.json(tasks1);
        }
      });
    }
  });
}

//Get all event tasks managed by a user
TaskController.prototype.getEventManagedTasks = function(req, res) {

  var userId = req.decoded._id;
  var eventId = req.params.event_id;

  Task.find({
    manager_ref: userId,
    event_ref: eventId
  }, function(err, tasks) {

    if (err) {

      return res.status(500).send(err);
    } else if (!tasks) {

      return res.json([]);
    } else {

      Event.populate(tasks, {
        path: 'event_ref'
      }, function(err1, tasks1) {

        if (err1) {
          res.status(500).send(err1);
        } else {

          return res.json(tasks1);
        }
      });
    }
  });
}

module.exports = TaskController;
