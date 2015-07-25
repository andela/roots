'use strict';
var env = process.env.NODE_ENV || "development";
var app = require('./config/express')();
var port = process.env.PORT || 2015;
var config = require('./config/database.config');
var mongoose = require('mongoose');

mongoose.connect(config[env]);
app.listen(port, function(err) {
  if(err){
    console.log(err);
  }else{
    console.log('Server started on port: ' + port);
  }
});

module.exports = app;