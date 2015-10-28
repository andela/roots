'use strict';
angular.module('eventApp')
  .controller('moreEventsCtrl', ['$scope', '$rootScope', 'EventService', function($scope, $rootScope, EventService) {

    $scope.fetchEvents = function() {

      EventService.getAllEvents().then(function(data) {
        $scope.eventList = data.data;
      });
    };

    $scope.categories = ('Technology,Sport,Health,Music,Art,Science,Spirituality,Media,Family,Education,Party').split(',').map(function(category) {
      return {
        name: category
      };
    });

    $scope.getCountryCode = function() {
      var e = document.getElementById("ddlViewBy");
      var ctCode = e.options[e.selectedIndex].value;
      var ctName = e.options[e.selectedIndex].text;
      return {
        code: ctCode,
        text: ctName
      };
    };

    $scope.find = {
      name: '',
      category: '',
      venue: {
        country: ''
      }
    };

    $scope.countryCode = "";

    $scope.$watch("countryCode", function() {
      if (!$scope.countryCode) {
        $scope.find.venue.country = "";
        return;
      }
      $scope.find.venue.country = $scope.getCountryCode().text;
    });

    $rootScope.hideBtn = false;

  }]);
