'use strict';

var moment = require('moment');
var Promise = require('promise');
var Task = require('../models/task.model');
var User = require('../models/user.model');
var Event = require('../models/event.model');
var Volunteer = require('../models/volunteer.model');
var Utils = require('../middleware/utils');

var utils = new Utils();

var VolunteerController = function() {};

//API call for user to volunteer for an event

VolunteerController.prototype.volunteerForTask = function(req, res) {

  var taskId = req.params.task_id;
  var skills = req.body.skills;
  var volunteerId = req.decoded._id; //id of the user volunteering
  var eventId;
  var eventMail;
  var eventName;
  var volunteerName;
  var managerId;
  var managerEmail;

  //Check if user has already volunteered for same task
  Volunteer.findOne({
    user_ref: volunteerId,
    task_ref: taskId
  }, function(err, voluntr) {

    if (err) {
      return res.status(500).send(err);
    } else if (voluntr) {
      return res.status(422).send({
        success: false,
        message: 'User already volunteered for this task!'
      });
    } else {

      Task.findById(taskId, function(err, task) {

        if (err) {
          return res.status(500).send(err);
        } else if (!task) {
          return res.status(422).send({
            success: false,
            message: 'Invalid task id!'
          });
        } else {
          managerId = task.manager_ref;

          User.findById(managerId, function(err, manager) {
            managerEmail = manager.email;
            eventId = task.event_ref;

            //Validate if event specified for the task is valid
            Event.findById(eventId, function(err, evt) {

              if (err) {
                return res.status(500).send(err);
              } else if (!evt) {
                return res.status(422).send({
                  success: false,
                  message: 'Task event not found!'
                });
              } else {
                eventName = evt.name;

                //Validate event manager specified
                User.findById(evt.user_ref, function(err, user) {

                  if (err) {
                    return res.status(500).send(err);
                  } else if (!user) {
                    return res.status(422).send({
                      success: false,
                      message: 'Could not find event creator!'
                    });
                  } else {
                    eventMail = user.email;
                    User.findById(volunteerId, function(err, user) {

                      if (err) {
                        return res.status(500).send(err);
                      } else if (!user) {
                        return res.status(422).send({
                          success: false,
                          message: 'Invalid volunteer id!'
                        });
                      } else {

                        volunteerName = user.firstname;
                        var volunteer = new Volunteer();

                        volunteer.event_ref = eventId;
                        volunteer.task_ref = taskId;
                        volunteer.user_ref = volunteerId;
                        volunteer.skills = skills;

                        //Create a volunteer object, which is linked to a task
                        volunteer.save(function(err) {

                          if (err) {
                            return res.status(500).send(err);
                          } else {
                            //Send mail to the volunteer
                            var mailOptions = {
                              to: [eventMail, managerEmail],
                              from: 'World tree :heavy_check_mark: <no-reply@worldtreeinc.com>',
                              subject: volunteerName + ' volunteered for ' + eventName,
                              text: volunteerName + ' volunteered for ' + eventName,
                              html: 'Hello,\n\n' +
                                '<b>' + volunteerName + '</b> volunteered for your event: <b>' + eventName + '</b> .<br/> His skills are ' + skills + '. You can contact <b>' + volunteerName + '</b> at <b>' + managerEmail + '</b>.'
                                
                            };
                            utils.sendMail(mailOptions);
                            return res.json({success: true});
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          });
        }
      });
    }
  });
};

//API call for an event manager to accept a volunteer request

VolunteerController.prototype.addVolunteerToTask = function(req, res) {

  var taskId = req.params.task_id;
  var volunteerId = req.params.volunteer_id; //id of the volunteer object stored in db

  var eventName;
  var taskDescription;
  var volunteerEmail;
  var userId;

  //Check if volunteer has already volunteered for same task
  Task.findOne({
    _id: taskId,
    'volunteers.volunteer_ref': volunteerId
  }, function(err, task) {

    if (err) {
      return res.status(500).send(err);
    } else if (task) {
      return res.status(422).send({
        success: false,
        message: 'Volunteer is already added to task!'
      });
    } else {

      //Validate volunteer id
      Volunteer.findById(volunteerId, function(err, volunteer) {

        if (err) {
          return res.status(500).send(err);
        } else if (!volunteer) {
          return res.status(422).send({
            success: false,
            message: 'Invalid volunteer id!'
          });
        } else {
          //Fecth volunteer user details
          User.findById(volunteer.user_ref, function(err, user) {

            if (err) {
              return res.status(500).send(err);
            } else if (!user) {
              return res.status(422).send({
                success: false,
                message: 'Could not find volunteer details!'
              });
            } else {

              userId = user._id;
              volunteerEmail = user.email;

              //Validate task id
              Task.findById(taskId, function(err, task) {

                if (err) {
                  return res.status(500).send(err);
                } else if (!task) {
                  return res.status(422).send({
                    success: false,
                    message: 'Invalid task id!'
                  });
                } else {

                  taskDescription = task.description;

                  //Validate task event id
                  Event.findById(task.event_ref, function(err, evt) {

                    if (err) {
                      return res.status(500).send(err);
                    } else if (!evt) {
                      return res.status(422).send({
                        success: false,
                        message: 'Task event not found!'
                      });
                    } else {

                      eventName = evt.name;

                      //Update task model to indicate that volunteer
                      //has been added to the task
                      Task.findByIdAndUpdate(taskId, {
                        $push: {
                          volunteers: {
                            volunteer_ref: volunteerId,
                            user_ref: userId
                          }
                        }
                      }, {
                        'new': true
                      }, function(err, task) {

                        if (err) {
                          return res.status(500).send(err);
                        } else if (!task) {
                          return res.status(422).send({
                            success: false,
                            message: 'Error adding volunteer to event task!'
                          });
                        } else {

                          //Indicate that volunteer has been added to the task
                          //in the volunteer model
                          Volunteer.findByIdAndUpdate(volunteerId, {
                            $set: {
                              added: true
                            }
                          }, function(err, volunteer) {

                            if (err) {
                              return res.status(500).send(err);
                            } else if (!volunteer) {
                              return res.status(422).send({
                                success: false,
                                message: 'Error occured while updating volunteer details!'
                              });
                            } else {

                              //Send mail to volunteer
                              var mailOptions = {
                                to: volunteerEmail,
                                from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                                subject: 'You have been added as volunteer to ' + eventName + ' event',
                                text: 'You have been added as volunteer to <b>' + taskDescription + '</b> of <b>' + eventName + '</b> event.\nThank you for volunteering.',
                                html: 'Hello,\n\n' +
                                  'You have been added as volunteer to <b>' + taskDescription + '</b> of <b>' + eventName + '</b> event.\nThank you for volunteering.'
                              };

                              utils.sendMail(mailOptions);

                              return res.json({
                                success: true,
                                message: 'User added as volunteer.'
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
      });
    }
  });
};


//API call for volunteer or event manager to cancel volunteering
//for an event 

VolunteerController.prototype.removeVolunteerFromTask = function(req, res) {

  var volunteerId = req.params.volunteer_id; //id of the volunteer object stored in db

  Volunteer.findById(volunteerId, function(err, volunteer) {

    if (err) {
      return res.status(500).send(err);
    } else if (!volunteer) {
      return res.status(422).send({
        success: false,
        message: 'Invalid volunteer id!'
      });
    } else {

      //Remove volunteer ref from the task model
      Task.findByIdAndUpdate(volunteer.task_ref, {
        $pull: {
          volunteers: {
            volunteer_ref: volunteerId
          }
        }
      }, function(err, task) {

        if (err) {
          return res.status(500).send(err);
        } else {
          //Delete volunteer object
          Volunteer.remove({
            _id: volunteerId
          }, function(err) {

            if (err) {
              return res.status(500).send(err);
            } else {
              return res.json({
                success: true,
                message: 'User removed from volunteer list.'
              });
            }
          });
        }
      });
    }
  });
};

//API call for an event manager to schedule a task to a volunteer

VolunteerController.prototype.addSchedule = function(req, res) {

  var taskId = req.params.task_id;
  var volunteerId = req.params.volunteer_id; //id of the volunteer object stored in db
  var schedule = req.body.schedule;

  if (!schedule) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }

  var taskDescription;
  var volunteerEmail;
  var eventName;
  var prevSchedules;

  //Validate volunteer id
  Volunteer.findById(volunteerId, function(err, volunteer) {

    if (err) {
      return res.status(500).send(err);
    } else if (!volunteer) {
      return res.status(422).send({
        success: false,
        message: 'Invalid volunteer id!'
      });
    } else {

      //Retrieve all previous schedules assigned to volunteer
      prevSchedules = volunteer.schedules;

      //Populate volunteer object with matching volunteer user details
      //from user model
      User.populate(volunteer, {
        'path': 'user_ref'
      }, function(err, volunteer) {

        if (err) {
          return res.status(500).send(err);
        } else if (!volunteer) {
          return res.status(422).send({
            success: false,
            message: 'Unable to retrieve volunteer user details!'
          });
        } else {

          volunteerEmail = volunteer.user_ref.email;

          //Check if volunteer has been added to the specified task
          //before assigning any task to volunteer
          Task.findOne({
            _id: taskId,
            'volunteers.volunteer_ref': volunteerId
          }, function(err, task) {

            if (err) {
              return res.status(500).send(err);
            } else if (!task) {
              return res.status(422).send({
                success: false,
                message: 'Volunteer not added to the specified task!'
              });
            } else {

              taskDescription = task.description;

              //Retrieve task event
              Event.findById(task.event_ref, function(err, evt) {

                if (err) {
                  return res.status(500).send(err);
                } else if (!evt) {
                  return res.status(422).send({
                    success: false,
                    message: 'Task event not found!'
                  });
                } else {

                  eventName = evt.name;

                  //Add schedule to volunteer
                  Volunteer.findByIdAndUpdate(volunteerId, {
                    $push: {
                      schedules: schedule

                    }
                  }, {
                    'new': true
                  }, function(err, volunteer) {

                    if (err) {
                      return res.status(500).send(err);
                    } else if (!volunteer) {
                      return res.status(422).send({
                        success: false,
                        message: 'Error scheduling task to volunteer!'
                      });
                    } else {

                      //After retrieving the volunteer's complete new schedule list
                      //compare it with the prev schedule list to get newly added schedule
                      var newSchedules = volunteer.schedules;
                      var index;

                      prevSchedules.forEach(function(prevSchd) {

                        var isNewSchd = newSchedules.every(function(newSchd) {

                          if (newSchd._id.toString() === prevSchd._id.toString()) {

                            index = newSchedules.indexOf(newSchd);
                            return false;
                          }

                          return true;
                        });

                        if (!isNewSchd) {

                          newSchedules.splice(index, 1);
                        }
                      });

                      if (newSchedules.length > 0) {

                        for (var i = 0; i < newSchedules.length; i++) {

                          if (schedule.description === newSchedules[i].startDate && schedule.startDate === newSchedules[i].endDate && schedule.description === newSchedules[i].endDate) {

                            newSchedules[0] = newSchedules[i];

                            break;
                          }
                        }
                      }

                      //Send notification to volunteer
                      var mailOptions = {
                        to: volunteerEmail,
                        from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                        subject: 'A task has been assigned to you on ' + eventName + ' event',
                        text: '<b>' + schedule.description + ' </b> task has been assigned to you on <b>' + eventName + ' event. Thank you as we look forward to your punctuality.<b>',
                        html: 'Hello,\n\n' +
                          '<b>' + schedule.description + '</b> task has been assigned to you on <b>' + eventName + '</b> event. Thank you as we look forward to your punctuality.'
                      };

                      utils.sendMail(mailOptions);

                      return res.json(newSchedules[0]);
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
};

VolunteerController.prototype.editSchedule = function(req, res) {

  var scheduleId = req.params.schedule_id;
  var volunteerId = req.params.volunteer_id; //id of the volunteer object stored in db
  var schedule = req.body.schedule;

  if (!schedule) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }

  //Update volunteer schedule by id
  Volunteer.findOneAndUpdate({
    _id: volunteerId,
    'schedules._id': scheduleId
  }, {
    $set: {
      'schedules.$.description': schedule.description,
      'schedules.$.endDate': schedule.endDate,
      'schedules.$.startDate': schedule.startDate,
      'schedules.$.completed': schedule.completed
    }
  }, function(err, schedule) {

    if (err) {
      return res.status(500).send(err);
    } else if (!schedule) {
      return res.status(422).send({
        success: false,
        message: 'Update failed, please check details!'
      });
    } else {

      return res.json({
        success: true,
        message: 'Schedule edited.'
      });
    }
  });
}

VolunteerController.prototype.deleteSchedule = function(req, res) {

  var scheduleId = req.params.schedule_id;
  var volunteerId = req.params.volunteer_id; //id of the volunteer object stored in db

  //Delete schedule by id
  Volunteer.findOneAndUpdate({
    _id: volunteerId
  }, {
    $pull: {
      'schedules': {
        _id: scheduleId
      }
    }
  }, function(err, volunteer) {

    if (err) {
      return res.status(500).send(err);
    } else if (!volunteer) {
      return res.status(422).send({
        success: false,
        message: 'Delete failed!'
      });
    } else {

      return res.json({
        success: true,
        message: 'Schedule deleted.'
      });
    }
  });
};

//Get list of users who volunteered for a task
VolunteerController.prototype.getTaskVolunteers = function(req, res) {

  var taskId = req.params.task_id;

  Volunteer.find({
    task_ref: taskId
  }, function(err, volunteers) {

    if (err) {
      return res.status(500).send(err);
    } else if (!volunteers || !volunteers.length) {

      return res.status(422).send({
        success: false,
        message: 'No matching volunteers found!'
      });
    } else {

      //Populate the volunteers list with their matching
      //user details from user model
      User.populate(volunteers, {
        'path': 'user_ref'
      }, function(err, populatedVolunteers) {

        if (err || !populatedVolunteers) {
          return ({
            success: false,
            message: 'Error populating volunteers details!'
          });
        } else {
          res.json(populatedVolunteers);
        }
      });
    }
  });
};

//Get list of users who were added to an event
VolunteerController.prototype.getEventVolunteers = function(req, res) {

  var eventId = req.params.event_id;

  Volunteer.find({
    event_ref: eventId,
    added: true
  }, function(err, volunteers) {

    if (err) {
      return res.status(500).send(err);
    } else if (!volunteers || !volunteers.length) {

      return res.status(422).send({
        success: false,
        message: 'No matching volunteers found!'
      });
    } else {

      //Populate the volunteers list with their matching
      //user details from user model
      User.populate(volunteers, {
        'path': 'user_ref'
      }, function(err, populatedVolunteers) {

        if (err || !populatedVolunteers) {
          return ({
            success: false,
            message: 'Error populating volunteers details!'
          });
        } else {
          res.json(populatedVolunteers);
        }
      });
    }
  });
};

VolunteerController.prototype.scheduleReminder = function() {

  var scheduleLimit = new Date();
  var now = new Date();
  scheduleLimit.setHours(scheduleLimit.getHours() + 1);

  Volunteer.find({
    'schedules.startDate': {
      $lte: scheduleLimit,
      $gt: now
    }
  }, {
    schedules: {
      $elemMatch: {
        startDate: {
          $lte: scheduleLimit,
          $gt: now
        }
      }
    }
  }, function(err, volunteers) {

    if (!err && volunteers.length) {
      User.populate(volunteers, {
        'path': 'user_ref'
      }, function(err, populatedVolunteers) {

        if (!err) {

          //Get list of volunteers to send remiders too, about one hour
          //before schedule

          var promiseObject = function(curIndex) {

            return new Promise(function(resolve) {

              var volunteer = populatedVolunteers[curIndex];

              //Retrieve event details
              Event.findById(volunteer.event_ref, function(err, evt) {

                if (err || !evt) {
                  resolve(curIndex);
                } else {

                  var schedules = "";

                  //Populate schedule list(s) details 
                  volunteer.schedules.forEach(function(schedule) {

                    schedules += schedule.description + ": between " + moment().format('ddd, DD, MMM, YYYY HH:mm ZZ', schedule.startDate);
                    schedules += " and " + moment().format('ddd, DD, MMM, YYYY HH:mm ZZ', schedule.endDate) + "\n\n"
                  });

                  //Send reminder to volunteer
                  var mailOptions = {
                    to: volunteer.user_ref.email,
                    from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                    subject: 'A gentle reminder from ' + evt.name + ' event',
                    text: 'This is a gentle reminder of a task(s) from <b>' + evt.name + '</b> event, which you volunteered for. Following is the task(s) scheduled to start in about an hour time\n<b>' + schedules + '</b>\n. Thanks for your anticipated promptness.',
                    html: 'Hello,\n\n' +
                      'This is a gentle reminder of a task(s) from <b>' + evt.name + '</b> event, which you volunteered for. Following is the task(s) scheduled to start in about an hour time\n<b>' + schedules + '</b>\n. Thanks for your anticipated promptness.'
                  };

                  utils.sendMail(mailOptions);
                  resolve(curIndex);
                }
              });

            });
          }

          //Executes recursively to loop through all the volunteer objects

          var promiseObjectLoop = function(curIndex) {
            promiseObject(curIndex).then(function(prevIndex) {
              prevIndex += 1;
              if (prevIndex < populatedVolunteers.length) {
                promiseObjectLoop(prevIndex);
              }
            });
          }
          if (populatedVolunteers.length) {
            promiseObjectLoop(0);
          }
        }

      });
    }
  });
};

//Get all task schedules for a user
VolunteerController.prototype.getVolunteeredTasks = function(req, res) {

  var userId = req.decoded._id;

  Volunteer.find({
    user_ref: userId
  }, function(err, voluntr) {

    if (err) {

      return res.status(500).send(err);
    } else if (!voluntr) {

      return res.json([]);
    } else {

      Event.populate(voluntr, {
        path: 'event_ref'
      }, function(err1, voluntr1) {

        if (err1) {
          res.status(500).send(err1);
        } else {

          Task.populate(voluntr1, {
            path: 'task_ref'
          }, function(err1, voluntr2) {

            if (err1) {
              res.status(500).send(err1);
            } else {
              return res.json(voluntr2);
            }
          });
        }
      });
    }
  });
};

//Get a volunteer's task's schedules
VolunteerController.prototype.getVolunteeredTask = function(req, res) {

  var volunteerId = req.params.volunteer_id;

  Volunteer.findById(volunteerId, function(err, voluntr) {

    if (err) {

      return res.status(500).send(err);
    } else if (!voluntr) {

      return res.json([]);
    } else {

      Event.populate(voluntr, {
        path: 'event_ref'
      }, function(err1, voluntr1) {

        if (err) {
          res.status(500).send(err);
        } else {

          Task.populate(voluntr1, {
            path: 'task_ref'
          }, function(err1, voluntr2) {

            if (err1) {
              return res.status(500).send(err1);
            } else {
              return res.json(voluntr2);
            }
          });

        }
      });
    }
  });
};

//Get all volunteer's tasks' schedules for an event
VolunteerController.prototype.getEventVolunteersTaskSchedules = function(req, res) {

  var eventId = req.params.event_id;
  var userId = req.decoded._id;

  Volunteer.find({
    user_ref: userId,
    event_ref: eventId,
    added: true
  }, function(err, voluntrs) {

    if (err) {

      return res.status(500).send(err);
    } else if (!voluntrs) {

      return res.json([]);
    } else {

      Event.populate(voluntrs, {
        path: 'event_ref'
      }, function(err1, voluntrs1) {

        if (err1) {
          res.status(500).send(err1);
        } else {

          Task.populate(voluntrs1, {
            path: 'task_ref'
          }, function(err1, voluntrs2) {

            if (err1) {
              return res.status(500).send(err1);
            } else {
              return res.json(voluntr2);
            }
          });
        }
      });
    }
  });
};

module.exports = VolunteerController;
