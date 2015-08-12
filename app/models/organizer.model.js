'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var organizerSchema = new mongoose.Schema({
  userId: {
    type: String,
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
  logo: {
    type: String
  },
  staff: [{
    userId: {
      type: String,
      required: true,
      index: {
        unique: true
      }
    },
    department: {
      type: String,
      required: true,
      index: {
        unique: true
      }
    }

  }]

}, {
  versionKey: false
});

var Organizer = mongoose.model('Organizer', organizerSchema);

module.exports = Organizer;
