'use strict';

var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  organizer: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  eventBanner: String,
  location: {
    type: String,
    required: false
  },
  eventUrl: String,
  eventTheme: {
    type: String,
    default: 'white'
  }
  startDate: {
    type: Date,
    required: false
  },
  endDate: {
    type: Date,
    required: false,
  },
  task[{
    manager: String,
    description: String,
    startAt: Date,
    endAt: Date,
    completed: {
      type: Boolean,
      default: false
    },
    assignees: [{
      name: String,
      staff: {
        type: Boolean,
        default: false
      },
      schedules: [{
        description: String,
        startAt: Date,
        endAt: Date,
        completed: {
          type: Boolean,
          default: false
        }

      }]
    }],
    subtasks: [{
      manager: String,
      description: String,
      startAt: Date,
      endAt: Date,
      completed: {
        type: Boolean,
        default: false
      },
      assignees: [{
        name: String,
        staff: {
          type: Boolean,
          default: false
        },
        schedules: [{
          description: String,
          startAt: Date,
          endAt: Date,
          completed: {
            type: Boolean,
            default: false
          }

        }]
      }]
    }]

  }]


});

var Event = mongoose.model('Event', eventSchema);
module.exports = Event;
