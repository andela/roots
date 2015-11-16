'use strict';

var mongoose = require('mongoose');

var taskSchema = new mongoose.Schema({

  event_ref: {
    type: String,
    ref: 'Event',
    required: true
  },
  manager_ref: {
    type: String,
    ref: 'User',
    required: true
  },
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
  },
  volunteers: [{
    volunteer_ref: {
      type: String,
      ref: 'Volunteer'
    }
  }]

}, {
  versionKey: false
});

var Task = mongoose.model('Task', taskSchema);

module.exports = Task;
