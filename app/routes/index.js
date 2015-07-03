var express = require('express');
var router = express.Router();
var cors = require('cors');
var config = require('../../config/cors.config');

module.exports = function(app) {
  router.route('/')
    .get(function(req, res) {
      res.json({success: true, text:'Welcome to World Tree Inc'});
    });


  app.use(cors(config.corsOptions));

  app.use('', router);

  app.use(function(req, res, next) {
    res.status(404).json({error: "The path does not exists"});
    next();
  });
};
