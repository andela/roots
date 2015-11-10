"use strict";
angular.module('eventApp')
  .factory('VolunteerService', ['$http', '$rootScope', function($http, $rootScope) {
    return {

      volForTask: function(taskId) {
        var token = localStorage.getItem('userToken');
        return $http.post("/api/task/"+ taskId +"/volunteers?token=" + token);
      },
      getAllVolsForTask: function(taskId) {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/task/"+ taskId +"/volunteers?token=" + token);
      },
      addVolToTask: function(taskId, volunteerId) {
        var token = localStorage.getItem('userToken');
        return $http.post("/api/task/" + taskId + "/volunteers/" + volunteerId + "?token=" + token);
      },
      removeVolFromTask: function(taskId, volunteerId) {
        var token = localStorage.getItem('userToken');
        return $http.delete("/api/task/" + taskId + "/volunteers/" + volunteerId + "?token=" + token);
      },
      addSchedToVol: function(taskId, volunteerId, param) {
        var token = localStorage.getItem('userToken');
        return $http.post("/api/task/" + taskId + "/volunteers/" + volunteerId +"/schedules?token=" + token, param);
      },
      editSchedule: function(scheduleId, volunteerId, param) {
        var token = localStorage.getItem('userToken');
        return $http.put("/api/task/volunteers/" + volunteerId + "/schedules/" + scheduleId + "?token=" + token, param);
      },
      deleteSchedule: function(scheduleId, volunteerId) {
        var token = localStorage.getItem('userToken');
        return $http.delete("/api/task/volunteers/" + volunteerId + "/schedules/" + scheduleId + "?token=" + token);
      },
      getEventVols: function(eventId) {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/event/" + eventId + "/volunteers?token=" + token);
      },
      getUserTaskSchedule: function() {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/user/volunteers?token=" + token);
      },
      getVolTaskSchedule: function(volunteerId) {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/tasks/volunteers/" + volunteerId + "?token=" + token);
      },
      getEventVolsTaskSchedule: function(eventId) {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/event/" + eventId + "/user/volunteers?token=" + token);
      }

    };
  }]);
