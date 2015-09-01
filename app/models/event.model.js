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
<<<<<<< HEAD
    ref: 'User'
=======
    required: true
>>>>>>> feat(main app): frontend
  },
  description: {
    type: String,
    required: true
  },
<<<<<<< HEAD
  online: {
    type: Boolean,
    default: false
  },
  country: {
    type: String
=======
  country: {
    type: String  
>>>>>>> feat(main app): frontend
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
<<<<<<< HEAD
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
=======
  // startDate: {
  //   type: Date,
  //   required: true
  // },
  // endDate: {
  //   type: Date,
  //   required: true
  // },

>>>>>>> feat(main app): frontend
  versionKey: false
});

mongoose.model('Event', eventSchema);
