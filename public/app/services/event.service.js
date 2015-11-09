"use strict";
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
      },
      editEventDetails: function(evtObj, ID) {
          
          var token = localStorage.getItem('userToken');          
          return  Upload.upload({
              method: "PUT",
              url: '/api/event/' + ID + '?token='+ token,
              file: evtObj.newImageUrl,
              fields: evtObj
            });          
      },
      deleteEvent: function(evID) {
          
          var token = localStorage.getItem('userToken');
          return $http.delete("/api/event/"+ evID + "?token=" + token);
      },      
      getAllEvents: function() {
          return $http.get("/api/events");
      },
      getEvent: function(eventId) {
          var token = localStorage.getItem('userToken');
          return $http.get("/api/event/" + eventId + "?token=" + token);
      },
      getMyPublishedEvents: function() {
          var token = localStorage.getItem('userToken');                 
          return $http.get("/api/events/published?token=" + token);
      },
      getMyEventDrafts: function() {
          var token = localStorage.getItem('userToken');        
          return $http.get("/api/events/saved?token=" + token);
      },
      publishEvent: function(eventId) {   
          var token = localStorage.getItem('userToken');       
          return $http.put("/api/event/" + eventId + "/launch?token=" + token);
      }
    };
  }]);
