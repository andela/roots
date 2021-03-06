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
  enableVolunteer: {
    type: Boolean,
    default: false
  },  
  venue: {
    name: String,
    country: String,
    countryCode: String,
    state: String,
    town: String,
    address: {
      type: String,
      required: true
    },
    latitude: Number,
    longitude: Number
  },
  imageUrl: {
    type: String

  },
  eventTheme: {    
    headerColor: String,
    fontColor: String,
    borderColor: String,
    contentColor: String

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
  }]
},{
  versionKey: false
});

var Event = mongoose.model('Event', eventSchema);
module.exports = Event;