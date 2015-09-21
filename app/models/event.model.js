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
    ref: 'User'
  },
  description: {
    type: String,
    required: true
  },
  online: {
    type: Boolean,
    default: false
  },
  country: {
    type: String
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
  eventTheme: {    
    headerColor: String,
    fontColor: String,
    borderColor: String,
    contentColor: String
  },
  eventFont: {
    color: {
      type: String,
      default: 'black'
    },
    size: {
      type: Number,
      default: 14
    },
    style: {
      type: String,
      default: 'Courier'
    }
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
},{
  versionKey: false
});

var Event = mongoose.model('Event', eventSchema);
module.exports = Event;
