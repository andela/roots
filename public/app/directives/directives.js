"use strict";
angular.module('eventApp')
  .directive("countryList", function() {
    return {
      restrict: 'E',
      scope: {
        countryCode: '='
      },
      templateUrl: '../app/views/country.list.html'
    };
  });

angular.module('eventApp')
  .directive('addressBasedGoogleMap', function() {
    return {
      restrict: "A",
      template: "<div id='addressMap'></div>",
      scope: {
        address: "=",
        zoom: "="
      },
      controller: function($scope) {
        var geocoder;
        var latlng;
        var map;
        var marker;
        var initialize = function() {
          geocoder = new google.maps.Geocoder();
          var mapOptions = {
            zoom: $scope.zoom,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          map = new google.maps.Map(document.getElementById('addressMap'), mapOptions);
        };
        var markAdressToMap = function() {
          geocoder.geocode({
              'address': $scope.address
            },
            function(results, status) {
              if (status === google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                marker = new google.maps.Marker({
                  map: map,
                  position: results[0].geometry.location
                });
              }
            });
        };
        $scope.$watch("address", function() {
          if ($scope.address !== undefined) {
            markAdressToMap();
          }
        });
        initialize();
      },
    };
  });

angular.module('eventApp')
  .directive('jqdatepicker', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModelCtrl) {
        $(element).datepicker({
          dateFormat: 'mm-dd-yy',
          minDate: 0,

          onSelect: function(date) {
            var ngModelName = this.attributes['ng-model'].value;

            // if value for the specified ngModel is a property of 
            // another object on the scope
            if (ngModelName.indexOf(".") !== -1) {
              var objAttributes = ngModelName.split(".");
              var lastAttribute = objAttributes.pop();
              var partialObjString = objAttributes.join(".");
              var partialObj = eval("scope." + partialObjString);

              partialObj[lastAttribute] = date;
            }
            // if value for the specified ngModel is directly on the scope
            else {
              scope[ngModelName] = date;
            }
            scope.$apply();
          }

        });
      }
    };
});

