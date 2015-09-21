var express = require('express');
var UserController = require('../controllers/user.controller');
var TaskController = require('../controllers/task.controller');
var taskCtrl = new TaskController();
var userCtrl = new UserController();
var router = express.Router();

module.exports = function(app) {

  router.route('/event/:event_id/tasks')
    //Create a task
    .post(userCtrl.verifyToken, taskCtrl.addTask)
    //Get all tasks created for an event
    .get(userCtrl.verifyToken, taskCtrl.getEventTasks);

  router.route('/event/:event_id/task/:task_id')
    //Get task details
    .get(userCtrl.verifyToken, taskCtrl.getTask)
    //Edit task details
    .put(userCtrl.verifyToken, taskCtrl.editTask)
    //Delete task
    .delete(userCtrl.verifyToken, taskCtrl.deleteTask);

  app.use('/api', router);
}
