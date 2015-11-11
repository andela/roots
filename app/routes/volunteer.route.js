 var express = require('express');
 var UserController = require('../controllers/user.controller');
 var VolunteerController = require('../controllers/volunteer.controller');
 var volunteerCtrl = new VolunteerController();
 var userCtrl = new UserController();
 var router = express.Router();

 module.exports = function(app) {

   router.route('/task/:task_id/volunteers')
     //Register user as volunteer for task
     .post(userCtrl.verifyToken, volunteerCtrl.volunteerForTask)
     //Get list of users who volunteered for a task
     .get(userCtrl.verifyToken, volunteerCtrl.getTaskVolunteers);

   router.route('/task/:task_id/volunteers/:volunteer_id')
     //Accept user as volunteer for task
     .post(userCtrl.verifyToken, volunteerCtrl.addVolunteerToTask)
     //Delete volunteer from task
     .delete(userCtrl.verifyToken, volunteerCtrl.removeVolunteerFromTask);

   router.route('/task/:task_id/volunteers/:volunteer_id/schedules')
     //Add schedule to volunteer
     .post(userCtrl.verifyToken, volunteerCtrl.addSchedule);

   router.route('/task/volunteers/:volunteer_id/schedules/:schedule_id')
     //Edit schedule details
     .put(userCtrl.verifyToken, volunteerCtrl.editSchedule)
     //Delete schedule
     .delete(userCtrl.verifyToken, volunteerCtrl.deleteSchedule);

   router.route('/event/:event_id/volunteers')
     //Get list of volunteers added to an event
     .get(userCtrl.verifyToken, volunteerCtrl.getEventVolunteers);

   router.route('/user/volunteers')
     //Get all task schedules for a user
     .get(userCtrl.verifyToken, volunteerCtrl.getVolunteeredTasks);

   router.route('/tasks/volunteers/:volunteer_id')
     //Get a volunteer's task's schedules
     .get(userCtrl.verifyToken, volunteerCtrl.getVolunteeredTask);

   router.route('/event/:event_id/user/volunteers')
     //Get all volunteer's tasks' schedules for an event
     .get(userCtrl.verifyToken, volunteerCtrl.getEventVolunteersTaskSchedules);

   router.route('/event/:event_id/volunteers/pending')
     //Get all event volunteers that are yet to be added to a task
     .get(userCtrl.verifyToken, volunteerCtrl.getPendingVolunteers);

   app.use('/api', router);
 }
