var express = require('express');
var UserController = require('../controllers/user.controller');
var TaskController = require('../controllers/task.controller');
var taskCtrl = new TaskController();
var userCtrl = new UserController();
var router = express.Router();

module.exports = function(app) {

  router.route('/event/:event_id/tasks')
    .post(userCtrl.verifyToken, taskCtrl.addTask)
    .get(userCtrl.verifyToken, taskCtrl.getEventTasks);

  router.route('/event/:event_id/task/:task_id')
    .get(userCtrl.verifyToken, taskCtrl.getTask)
    .put(userCtrl.verifyToken, taskCtrl.editTask)
    .delete(userCtrl.verifyToken, taskCtrl.deleteTask);

  router.route('/task/:task_id/volunteers')
    .post(userCtrl.verifyToken, taskCtrl.addVolunteer)
    .get(userCtrl.verifyToken, taskCtrl.getTaskVolunteers);

  router.route('/task/:task_id/volunteers/:volunteer_id')
    .delete(userCtrl.verifyToken, taskCtrl.removeVolunteer);

  router.route('/task/:task_id/volunteers/schedules/:schds_id')
    .post(userCtrl.verifyToken, taskCtrl.addSchedule);

  router.route('/task/:task_id/volunteers/schedules/:schd_id')
    .put(userCtrl.verifyToken, taskCtrl.editSchedule)
   
  app.use('/api', router);
}
