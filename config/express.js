var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require("method-override");
var path = require('path');
var appDir = path.dirname(require.main.filename);

module.exports = function() {
  var app = express();
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
  app.use(methodOverride());
  app.use(express.static(path.join(appDir + '/public')));
  app.get('/', function(req, res) {
    res.sendFile(appDir + '/public/index.html');
  });
  require('../app/routes/')(app);
  return app;
};