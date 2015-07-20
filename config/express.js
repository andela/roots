var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require("method-override");

module.exports = function() {
  var app = express();
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
  app.use(methodOverride());
  require('../app/routes/')(app);
  return app;
};
