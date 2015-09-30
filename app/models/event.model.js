  'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
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
  org_name: {
    type: String,
    required: true,
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
    type: String
  },
  imageUrl: {
    type: String
  },
  headerColor: {
    type: String
  },
  fontColor: {
    type: String
  },
  borderColor: {
    type: String
  },
  contentColor: {
    type: String
  },
  eventFont: {
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

mongoose.model('Event', eventSchema);
