angular.module('eventApp')
  .factory('EventService', ['$http', '$stateParams', '$location', '$rootScope', 'Upload', 'baseUrl', function($http, $stateParams, $location, $rootScope, Upload, baseUrl) {

    var token = localStorage.getItem('userToken');

    return {
      createEvent: function(evtObj) {
          
          return  Upload.upload({
            method: "POST",
            url: '/api/event?token=' + token,
            file: evtObj.imageUrl,
            fields: evtObj
         });      
          // return $http.post(baseUrl + "event?token=" + token, {userId: $rootScope.userId, eventObj: evtObj});
      },
      editEventDetails: function(evtObj, ID) {
          
          return  Upload.upload({
              method: "PUT",
              url: '/api/event/' + ID + '?token='+ token,
              file: evtObj.imageUrl,
              fields: evtObj
            })
          // return $http.put(baseUrl + "event/"+ ID + "?token=" + token);
      },
      deleteEvent: function(evID) {
          
          return $http.delete(baseUrl + "event/"+ evID + "?token=" + token);
      },
      editEventTasks: function(data, param) {
          return $http.put(baseUrl + "event/:event_id/tasks" + token, data, param);
      },
      getAllEvents: function() {
          return $http.get(baseUrl + "events");
      },
      getEvent: function(eventId) {
          return $http.get(baseUrl + "event/" + eventId);
      },
      getMyPublishedEvents: function() {         
          return $http.get(baseUrl + "events/published?token=" + token);
      },
      getMyEventDrafts: function() {          
          return $http.get(baseUrl + "events/saved?token=" + token);
      },
      publishEvent: function(eventId) {          
          return $http.put(baseUrl + "/event/" + eventId + "/launch?token=" + token);
      }
    };
  }]);
