"use strict";
angular.module('eventApp')
  .factory('VolunteerService', ['$http', '$rootScope', function($http, $rootScope) {
    return {

      volForTask: function(volunteer) {
        var token = localStorage.getItem('userToken');
        return $http.post("/api/task/"+ volunteer.id +"/volunteers?token=" + token, volunteer);
      },      
      getVolunteeredTasks: function() {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/user/volunteers?token=" + token);
      },      
      getAllMyEventVolunteers: function(eventId) {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/event/" + eventId + "/user/volunteers?token=" + token);
      },
      getTaskPendingVolunteers: function(taskId) {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/task/" + taskId + "/volunteers/pending?token=" + token);
      },
      addVolunteerToTask: function(taskId, volunteerId) {
        var token = localStorage.getItem('userToken');
        return $http.post("/api/task/" + taskId + "/volunteers/" + volunteerId + "?token=" + token);
      },
      removeVolunteerFromTask: function(taskId, volunteerId) {
        var token = localStorage.getItem('userToken');
        return $http.delete("/api/task/" + taskId + "/volunteers/" + volunteerId + "?token=" + token);
      },
      addTaskSchedule: function(taskId, volunteerId, schedule) {
        var token = localStorage.getItem('userToken');
        return $http.post("/api/task/" + taskId + "/volunteers/" + volunteerId + "/schedules?token=" + token, {
          schedule: schedule
        });
      },
      editSchedule: function(volunteerId, scheduleId, schedule) {
        var token = localStorage.getItem('userToken');
        return $http.put("/api/task/volunteers/" + volunteerId + "/schedules/" + scheduleId + "?token=" + token, {
          schedule: schedule
        });
      },
      deleteSchedule: function(volunteerId, scheduleId) {
        var token = localStorage.getItem('userToken');
        return $http.delete("/api/task/volunteers/" + volunteerId + "/schedules/" + scheduleId + "?token=" + token);
      }
    };
  }]);
