"use strict";
angular.module('eventApp')
  .factory('TaskService', ['$http', '$rootScope', function($http, $rootScope) {

    return {

      createTask: function(eventId, param) {
        var token = localStorage.getItem('userToken');
        return $http.post("/api/event/" + eventId + "/tasks?token=" + token, param);
      },
      getAllTasks: function(eventId) {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/event/" + eventId + "/tasks?token=" + token);
      },
      getTask: function(eventId, taskId) {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/event/" + eventId + "/task/" + taskId + "?token=" + token);
      },
      editTask: function(eventId, taskId, param) {
        var token = localStorage.getItem('userToken');
        return $http.put("/api/event/" + eventId + "/task/" + taskId + "?token=" + token, param);
      },
      deleteTask: function(eventId, taskId) {
        var token = localStorage.getItem('userToken');
        return $http.delete("/api/event/" + eventId + "/task/" + taskId + "?token=" + token);
      },
      getAllUserTasks: function() {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/user/tasks?token=" + token);
      },
      getVolunteeredTasks: function() {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/user/volunteers?token=" + token);
      },
      getAllUserEventTasks: function(eventId) {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/event/" + eventId + "/user/tasks?token=" + token);
      },
      getAllMyEventVolunteers: function(eventId) {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/event/" + eventId + "/user/volunteers?token=" + token);
      },
      getEventPendingVolunteers: function(eventId) {
        var token = localStorage.getItem('userToken');
        return $http.get("/api/event/" + eventId + "/volunteers/pending?token=" + token);
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
