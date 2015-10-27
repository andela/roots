'use strict';
var app = require('./config/express')();
var port = process.env.PORT || 3030;
var config = require('./config/config');
var mongoose = require('mongoose');

var Utils = require('./app/middleware/utils');
var VolunteerController = require('./app/controllers/volunteer.controller');

var utils = new Utils();
var volunteerCtrl = new VolunteerController();


mongoose.connect(config.db);
app.listen(port, function(err) {
  if (err) {
    console.log(err);
  } else {

    try{
      utils.cronJob('0 0 * * * *', volunteerCtrl.scheduleReminder);//cron job runs every hour
    }catch(err){
      console.log('The following occured while starting cronJob module: ' + err);
    }
    console.log('Server started on port: ' + port);
  }
});

module.exports = app;
