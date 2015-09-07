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
    required: true
  },
  description: {
    type: String,
    required: true
  },
  country: {
    type: String  
  },
  venue: {
    type: String
  },
  eventBanner: {
    type: String
  },
  imageUrl: {
    type: String
  },
  eventTheme: {
    type: String,
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

  versionKey: false
});

mongoose.model('Event', eventSchema);
