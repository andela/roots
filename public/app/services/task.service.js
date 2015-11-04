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
      }
    };
  }]);
