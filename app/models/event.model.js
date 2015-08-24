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
  eventBanner: {
    type: String
  },
  eventUrl: {
    type: String
  },
  eventTheme: {
    type: String,
    default: 'white'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
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
    task_ref: {
      type: String,
      ref: 'Task'
    }
  }]
}, {
  versionKey: false
});

var Event = mongoose.model('Event', eventSchema);
module.exports = Event;
