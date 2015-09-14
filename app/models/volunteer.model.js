'use strict';

var mongoose = require('mongoose');

var volunteerSchema = new mongoose.Schema({

  event_ref: {
    type: String,
    ref: 'Event',
    required: true
  },
  task_ref: {
    type: String,
    ref: 'Task',
    required: true
  },
  user_ref: {
    type: String,
    ref: 'User',
    required: true
  },
  added: {
    type: Boolean,
    default: false
  },
  schedules: [{
    description: {
      type: String
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    completed: {
      type: Boolean,
      default: false
    }
  }]

}, {
  versionKey: false
});

var Volunteer = mongoose.model('Volunteer', volunteerSchema);

module.exports = Volunteer;
