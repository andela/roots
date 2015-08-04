'use strict';
process.env.NODE_ENV = process.env.NODE_ENV || "development";
var app = require('./config/express')();
var port = process.env.PORT || 2015;
var config = require('./config/config');
var mongoose = require('mongoose');

mongoose.connect(config.db);
app.listen(port, function(err) {
  if(err){
    console.log(err);
  }else{
    console.log('Server started on port: ' + port);
  }
});

module.exports = app;