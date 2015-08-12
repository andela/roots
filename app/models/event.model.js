'use strict';

var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
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
  venue: {
    country: String,
    name: String,
    address: String
  },
  eventBanner: String,
  location: {
    type: String
  },
  eventUrl: String,
  eventTheme: {
    type: String,
    default: 'white'
  }
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
  task[{
    managerId: {
      type: String,
      index: {
        unique: true
      }
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
      volunteerId: {
        type: String,
        index: {
          unique: true
        }
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
