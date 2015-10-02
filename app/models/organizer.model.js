'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var organizerSchema = new mongoose.Schema({
  user_ref: {
    type: String,
  },
  name: {
    type: String,
    required: true
  },
  about: {
    type: String
  },
  imageUrl: {
    type: String
  },
<<<<<<< HEAD
  phoneNumber1 : {
    type: Number
  }
  // staff: [{
  //   manager_ref: {
  //     type: String,
  //     ref: 'User'      
  //   },
  //   role: {
  //     type: String      
  //   }
  // }]
=======
  staff: [{
    manager_ref: {
      type: String,
      ref: 'User'
    },
    role: {
      type: String
    }
  }]
>>>>>>> feat(datetime picker) create event page:

}, {
  versionKey: false
});

mongoose.model('Organizer', organizerSchema);
