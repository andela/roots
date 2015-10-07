angular.module('eventApp')
  .controller('editeventCtrl',['$scope','$stateParams','UserService','$location', 'EventService','Upload','$rootScope', '$state', '$sce', function ($scope, $stateParams, UserService, $location, EventService, Upload, $rootScope, $state, $sce) {
    
    if (!localStorage.getItem('userToken')) {
      $location.url('/user/home');
    }

    EventService.getEvent($stateParams.event_id)
      .success(function(event){
        event.startDate = parseDate(event.startDate);
        event.endDate = parseDate(event.endDate);
        $scope.event = event;
      });

    $scope.categories = ('Technology,Sport,Health & Fitness,Music,Food & Drink,Arts,Parties,Business').split(',').map(function(category){
      return {
        name: category
      };
    });

    $scope.previewImg = function (inElement,prevElement){
      $(inElement).on('change', function () {
        var preview = document.querySelector(prevElement);
        var file    = document.querySelector(inElement).files[0];
        var reader  = new FileReader();
        reader.onloadend = function () {
          preview.src = reader.result;
        }

        if (file) {
          reader.readAsDataURL(file);
        } else {
          preview.src = "";
        }
      })
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
        })
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
    }
    $scope.cancelEdit = function (){
     
      $state.go('user.eventDetails', {event_id: $stateParams.event_id});
      document.body.scrollTop = document.documentElement.scrollTop = 0;

    };

    function parseDate(date){
      return new Date(Date.parse(date));
    }
}]);
