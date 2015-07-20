'use strict';
var env = process.env.NODE_ENV || "development";
var express = require('./config/express');
var app = express();
var exp = require('express');
var path = require('path');

var port = process.env.PORT || 2015;

var config = require('./config/database.config');
var mongoose = require('mongoose');

mongoose.connect(config[env]);
app.use(exp.static(path.join(__dirname + '/public')));
app.get('*', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, function(err) {
  if(err) {
    console.log(err);
  } 
  else {
    console.log('Server started on port: ' + port);
  }
});

module.exports = app;