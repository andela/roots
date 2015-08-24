'use strict';

var mongoose = require('mongoose');

var taskSchema = new mongoose.Schema({

  event_ref: {
    type: String,
    ref: 'Event'
  },
  manager_ref: {
    type: String,
    ref: 'User'
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  volunteers: [{
    volunteer_ref: {
      type: String,
      ref: 'User'
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
  }]

}, {
  versionKey: false
});

var Task = mongoose.model('Task', taskSchema);

module.exports = Task;
