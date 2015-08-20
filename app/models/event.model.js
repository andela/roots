'use strict';

var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  user_ref: {
    type: String,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  venue: {
    name: String,
    country: String,
    state: String,
    town: String,    
    address: {
      type: String,
      required: true
    },
    latitude: Number,
    longitude: Number
  },
  eventBanner: String,
  location: {
    type: String
  },
  eventUrl: String,
  eventTheme: {
    type: String,
    default: 'white'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  feedback: [{
    name: {
      type: String
    },
    email: {
      type: String
    },
    message: {
      type: String
    }
  }],
  tasks: [{
    manager_ref: {
      type: String,
      ref: 'User'
    },
    description: {
      type: String
    },
    startAt: {
      type: Date
    },
    endAt: {
      type: Date
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
        startAt: {
          type: Date
        },
        endAt: {
          type: Date
        },
        completed: {
          type: Boolean,
          default: false
        }
      }]
    }]
  }]

}, {
  versionKey: false
});

var Event = mongoose.model('Event', eventSchema);
module.exports = Event;
