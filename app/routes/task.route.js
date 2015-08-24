var express = require('express');
var UserController = require('../controllers/user.controller');
var TaskController = require('../controllers/task.controller');
var taskCtrl = new TaskController();
var userCtrl = new UserController();
var router = express.Router();

module.exports = function(app) {

  router.route('/event/:event_id/task')
    .post(userCtrl.verifyToken, taskCtrl.addOrEditTask);
  
  router.route('/event/:event_id/task/:task_id')
    .get(userCtrl.verifyToken, taskCtrl.getTask)
    .delete(userCtrl.verifyToken, taskCtrl.deleteTask);

  app.use('/api', router);
}
