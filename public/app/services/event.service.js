angular.module('eventApp')
  .factory('EventService', ['$http', '$stateParams', '$location', '$rootScope', 'Upload', 'baseUrl', function($http, $stateParams, $location, $rootScope, Upload, baseUrl) {
    return {
      createEvent: function(evtObj) {
          var token = localStorage.getItem('userToken');

          return  Upload.upload({
            method: "POST",
            url: '/api/event?token=' + token,
            file: evtObj.imageUrl,
            fields: evtObj
         });      
          // return $http.post(baseUrl + "event?token=" + token, {userId: $rootScope.userId, eventObj: evtObj});
      },
      editEventDetails: function(evtObj, ID) {
          var token = localStorage.getItem('userToken');

          return  Upload.upload({
              method: "PUT",
              url: '/api/event/' + ID + '?token='+ token,
              file: evtObj.imageUrl,
              fields: evtObj
            })
          // return $http.put(baseUrl + "event/"+ ID + "?token=" + token);
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
      },
      getOrganizer: function(name) {
          var token = localStorage.getItem('userToken');
          return $http.get(baseUrl + "myorganizer" + "?token=" + token + '&name=' + name);
      }
    };
  }]);
