'use strict';
require('dotenv').load();
var env = process.env.NODE_ENV || "development";
var express = require('express');
var port = process.env.PORT || 2015;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 2015;
var config = require('./config/database.config');
var mongoose = require('mongoose');
var router = express.Router();
var routes = require('./app/routes');

mongoose.connect(config[env]);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.get('/', function(req, res){res.send('Welcome to WOLRD TREE INC!')});
routes(router);
app.use('/api', router);
app.listen(port, function(err) {
  if(err){
    console.log(err);
  }else{
    console.log('Server started on port: ' + port);
  }
});