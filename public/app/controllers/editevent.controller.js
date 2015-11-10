"use strict";
angular.module('eventApp')
  .controller('editeventCtrl',['$scope','$stateParams', '$location', 'EventService', 'OrganizerService', 'Upload','$rootScope', '$state', '$sce', function ($scope, $stateParams, $location, EventService, OrganizerService, Upload, $rootScope, $state, $sce) {
    
    if (!localStorage.getItem('userToken')) {
      $location.url('/user/home');
    }
    
    $rootScope.hideBtn = true;

    EventService.getEvent($stateParams.event_id)
      .success(function(event){

        event.details.startDate = parseDate(event.details.startDate);
        event.details.endDate = parseDate(event.details.endDate);
        $scope.event = event.details;

        $('.md-warn').css('border-color', $scope.event.eventTheme.borderColor);
        $('.md-warn').css('background-color', $scope.event.eventTheme.headerColor);
        $('.md-warn').css('color', $scope.event.eventTheme.fontColor);
        $('.values').css('border-color', $scope.event.eventTheme.borderColor);
        $('.values').css('background-color', $scope.event.eventTheme.contentColor);
        $('.values').css('color', $scope.event.eventTheme.fontColor);

        if ($scope.event.user_ref.organizer_ref) {

          OrganizerService.getOrganizer($scope.event.user_ref.organizer_ref)
            .success(function(organizer) {                
              $scope.organizer = organizer;
              $scope.organizer.phoneNumber1 = $scope.event.user_ref.phoneNumber1;
            });
        }

      });

    $scope.categories = ('Technology,Sport,Health & Fitness,Music,Food & Drink,Arts,Parties,Business').split(',').map(function(category){
      return {
        name: category
      };
    });

    $scope.previewImg = function (inElement,prevElement,imageElement){
      $(inElement).on('change', function () {
        var preview = document.querySelector(prevElement);
        var file    = document.querySelector(inElement).files[0];
        var prevImage = document.querySelector(imageElement);
        var reader  = new FileReader();
        reader.onloadend = function () {
          preview.src = reader.result;

          if(prevImage){            
            prevImage.src = reader.result;            
          }
        };
        if (file) {
          reader.readAsDataURL(file);
        } else {
          preview.src = "";
          prevImage.src = "";
        }
    });
  };
    
    $scope.submitEventDetails = function (eventDetails){
     
      if(!eventDetails.startDate || !eventDetails.endDate){

        $window.alert('Select event start and end dates');
        return;

      }else if(eventDetails.startDate > eventDetails.endDate){
          $window.alert('invalid date range');
          return;
      }else{
        eventDetails.venue.country = $scope.getCountryCode().text;
        EventService.editEventDetails(eventDetails, $stateParams.event_id)
        .success(function(data) {
            $state.go('user.eventDetails', {event_id: $stateParams.event_id});
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        });
      }
    };

    $scope.getCountryCode = function() {
      var e = document.getElementById("ddlViewBy");
      var ctCode = e.options[e.selectedIndex].value;
      var ctName = e.options[e.selectedIndex].text;
      return {
       code: ctCode,
       text: ctName
      };
    };

    $scope.getCountry = function() {
      $scope.result = '';
      $scope.options1 = {
        country: $scope.getCountryCode().code
      };
      $scope.details = '';
    };

    $scope.cancelEdit = function (){
     
      $state.go('user.eventDetails', {event_id: $stateParams.event_id});
      document.body.scrollTop = document.documentElement.scrollTop = 0;

    };

    $scope.switchView = function() {
      $scope.prev = !$scope.prev;
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    };

    $scope.$watch("event.description",
      function(oldVal, newVal){
        if(oldVal !== newVal){
          $scope.eventInfo = $sce.trustAsHtml($scope.event.description);
      }
    });

    function parseDate(date){
      return new Date(Date.parse(date));
    }

    $scope.prev = false;
}]);
