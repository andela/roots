angular.module('eventApp')
  .factory('EventService', ['$http', '$stateParams', '$location', '$rootScope', 'baseUrl', function($http, $stateParams, $location, $rootScope, baseUrl) {
    return {
      createEvent: function(evtObj) {
          var token = localStorage.getItem('userToken');
          console.log('userId',$rootScope.userId, 'evtObj',evtObj);
          return $http.post(baseUrl + "event?token=" + token, {userId: $rootScope.userId, eventObj: evtObj});
      },
      editEventDetails: function(data, param) {
          var token = localStorage.getItem('userToken');
          return $http.put(baseUrl + "event/:event_id" + token, data, param);
      },
      deleteEvent: function(param) {
          var token = localStorage.getItem('userToken');
          return $http.delete(baseUrl + "event/:event_id" + token, param);
      },
      editEventTasks: function(data, param) {
          var token = localStorage.getItem('userToken');
          return $http.put(baseUrl + "event/:event_id/tasks" + token, data, param);
      },
      getAllEvents: function() {
          return $http.get(baseUrl + "events");
      },
      getEvent: function(eventId) {
          return $http.get(baseUrl + "event/:" + eventId);
      }
    };
  }]);
