 var express = require('express');
 var UserController = require('../controllers/user.controller');
 var VolunteerController = require('../controllers/volunteer.controller');
 var volunteerCtrl = new VolunteerController();
 var userCtrl = new UserController();
 var router = express.Router();

 module.exports = function(app) {

   router.route('/task/:task_id/volunteers')
     .post(userCtrl.verifyToken, volunteerCtrl.volunteerForTask)
     .get(userCtrl.verifyToken, volunteerCtrl.getTaskVolunteers);

   router.route('/task/:task_id/volunteers/:volunteer_id')
     .post(userCtrl.verifyToken, volunteerCtrl.addVolunteerToTask)
     .delete(userCtrl.verifyToken, volunteerCtrl.removeVolunteerFromTask);

   router.route('/task/:task_id/volunteers/:volunteer_id/schedules')
     .post(userCtrl.verifyToken, volunteerCtrl.addSchedule);

   router.route('/task/volunteers/:volunteer_id/schedules/:schedule_id')
     .put(userCtrl.verifyToken, volunteerCtrl.editSchedule)
     .delete(userCtrl.verifyToken, volunteerCtrl.deleteSchedule);

   router.route('/event/:event_id/volunteers')
     .get(userCtrl.verifyToken, volunteerCtrl.getEventVolunteers);

   app.use('/api', router);
 }
