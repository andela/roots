'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var organizerSchema = new mongoose.Schema({
  user_ref: {
    type: String,
    ref: 'User',
    required: true,
    index: {
      unique: true
    }
  },
  name: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  about: {
    type: String
  },
  imageUrl: {
    type: String
  },
  staff: [{
    manager_ref: {
      type: String,
      ref: 'User'      
    },
    role: {
      type: String      
    }
  }]

}, {
  versionKey: false
});

var Organizer = mongoose.model('Organizer', organizerSchema);

module.exports = Organizer;