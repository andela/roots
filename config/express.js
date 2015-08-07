var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require("method-override");
var path = require('path');
var appDir = path.dirname(require.main.filename);
var cors = require('cors');
var config = require('./config');
var routes = require('../app/routes/');
var app = express();
var passport = require('passport');
var session = require('express-session');

module.exports = function() {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));  
  app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
  app.use(methodOverride());
  app.use(cors(config.corsOptions));
  app.use(session({
    secret: 'blablabla',
    saveUninitialized: true,
    resave: false
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(express.static(path.join(appDir + '/public')));
  app.get('/', function(req, res) {
    res.sendFile(appDir + '/public/index.html');
  });
  require('./passport')();
  require('../app/routes/')(app);
  return app;
};