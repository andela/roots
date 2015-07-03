'use strict';
var env = process.env.NODE_ENV || "development";
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require('./config/database.config');
var port = process.env.PORT || 2015;
var mongoose = require('mongoose');

mongoose.connect(config[env]);

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, X-Requested-With, Authorization');
  next();
});

app.get('/', function(req, res) {
  res.send('Welcome to World Tree Inc');
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