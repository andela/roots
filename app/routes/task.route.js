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

  router.route('/user/tasks')
    //Get all tasks managed by a user
    .get(userCtrl.verifyToken, taskCtrl.getAllManagedTasks);

  router.route('/event/:event_id/user/tasks')
    //Get all event's tasks managed by a user
    .get(userCtrl.verifyToken, taskCtrl.getEventManagedTasks);

  app.use('/api', router);
}
