angular.module('eventApp')
  .factory('EventService', ['$http', '$stateParams', '$location', '$rootScope', 'baseUrl', function($http, $stateParams, $location, $rootScope, baseUrl) {
    return {
      createEvent: function(evtObj) {
          var token = localStorage.getItem('userToken');
          console.log('userId',$rootScope.userId, 'evtObj',evtObj);
          return $http.post(baseUrl + "event?token=" + token, {userId: $rootScope.userId, eventObj: evtObj});
      },
      editEventDetails: function(data, ID) {
          var token = localStorage.getItem('userToken');
          return $http.put(baseUrl + "event/"+ ID + "?token=" + token);
      },
      deleteEvent: function(evID) {
          var token = localStorage.getItem('userToken');
          return $http.delete(baseUrl + "event/"+ evID + "?token=" + token);
      },
      editEventTasks: function(data, param) {
          var token = localStorage.getItem('userToken');
          return $http.put(baseUrl + "event/:event_id/tasks" + token, data, param);
      },
      getAllEvents: function() {
          return $http.get(baseUrl + "events");
      },
      getEvent: function(eventId) {
          return $http.get(baseUrl + "event/" + eventId);
      }
    };
  }]);