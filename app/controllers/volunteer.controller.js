'use strict';

var Task = require('../models/task.model');
var User = require('../models/user.model');
var Event = require('../models/event.model');
var Volunteer = require('../models/volunteer.model');
var Utils = require('../middleware/utils');

var utils = new Utils();

var VolunteerController = function() {};

//API call for user to volunteer for an event

VolunteerController.prototype.volunteerForTask = function(req, res) {

  if (!req.body.volunteerId) {

    return res.status(422).send({
      success: false,
      message: 'Check parameters!'
    });
  }
  var taskId = req.params.task_id;
  var volunteerId = req.body.volunteerId; //id of the user volunteering
  var eventId;
  var eventMail;
  var eventName;
  var volunteerName;


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

          eventId = task.event_ref;

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

                  User.findById(user._id, function(err, user) {

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

                      volunteer.save(function(err) {

                        if (err) {
                          return res.status(500).send(err);
                        } else {

                          var mailOptions = {
                            to: eventMail,
                            from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                            subject: '<b>' + volunteerName + '</b> volunteered for <b>' + eventName + '</b>',
                            text: '<b>' + volunteerName + '</b> volunteered for your event: <b>' + eventName + '</b>.',
                            html: 'Hello,\n\n' +
                              '<b>' + volunteerName + '</b> volunteered for your event: <b>' + eventName + '</b>.'
                          };

                          utils.sendMail(mailOptions);

                          return res.json(volunteer);
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

//API call for an event manager to accept a volunteer request

VolunteerController.prototype.addVolunteerToTask = function(req, res) {

  var taskId = req.params.task_id;
  var volunteerId = req.params.volunteer_id; //id of the volunteer object stored in db

  var eventName;
  var taskDescription;
  var volunteerEmail;


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

      Volunteer.findById(volunteerId, function(err, volunteer) {

        if (err) {
          return res.status(500).send(err);
        } else if (!volunteer) {
          return res.status(422).send({
            success: false,
            message: 'Invalid volunteer id!'
          });
        } else {

          User.findById(volunteer.user_ref, function(err, user) {

            if (err) {
              return res.status(500).send(err);
            } else if (!user) {
              return res.status(422).send({
                success: false,
                message: 'Could not found volunteer details!'
              });
            } else {

              volunteerEmail = user.email;

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

                      Task.findByIdAndUpdate(taskId, {
                        $push: {
                          volunteers: {
                            volunteer_ref: volunteerId
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

                              var mailOptions = {
                                to: volunteerEmail,
                                from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                                subject: 'You have been added as volunteer to <b>' + eventName + '</b> event',
                                text: 'You have been added as volunteer to <b>' + taskDescription + '</b> of <b>' + eventName + '</b> event.\nThank you for your sacrifice.',
                                html: 'Hello,\n\n' +
                                  'You have been added as volunteer to <b>' + taskDescription + '</b> of <b>' + eventName + '</b> event.\nThank you for your sacrifice.'
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
}


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
}

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

  Volunteer.findById(volunteerId, function(err, volunteer) {

    if (err) {
      return res.status(500).send(err);
    } else if (!volunteer) {
      return res.status(422).send({
        success: false,
        message: 'Invalid volunteer id!'
      });
    } else {

      prevSchedules = volunteer.schedules;
      User.populate(volunteer, {
        'path': 'user_ref'
      }, function(err, user) {

        if (err) {
          return res.status(500).send(err);
        } else if (!user) {
          return res.status(422).send({
            success: false,
            message: 'Unable to retrieve volunteer user details!'
          });
        } else {

          volunteerEmail = user.email;

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

                          var mailOptions = {
                            to: volunteerEmail,
                            from: 'World tree ✔ <no-reply@worldtreeinc.com>',
                            subject: 'A task has been assigned to you on <b>' + eventName + '</b> event',
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
    }
  });
}

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
}

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

      User.populate(volunteers, {
        'path': 'user_ref'
      }, function(err, populatedVolunteers) {

        if (err || !populatedVolunteers) {
          done({
            success: false,
            message: 'Error populating volunteers details!'
          });
        } else {
          res.json(populatedVolunteers);
        }
      });
    }
  });
}

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

      User.populate(volunteers, {
        'path': 'user_ref'
      }, function(err, populatedVolunteers) {

        if (err || !populatedVolunteers) {
          done({
            success: false,
            message: 'Error populating volunteers details!'
          });
        } else {
          res.json(populatedVolunteers);
        }
      });
    }
  });
}

module.exports = VolunteerController;
