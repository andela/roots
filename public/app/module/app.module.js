'use strict';
angular.module('eventApp',['ui.router','ngMaterial', 'ngMessages', 'ngResource', 'ngAnimate','ngAria','summernote','ngFileUpload','ngAutocomplete','color.picker','ui.bootstrap','ui.bootstrap.datetimepicker','ngMap'])
  .config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('user.home',{
      url: '/home',
      templateUrl: '../app/views/home.view.html',
      controller: 'homeCtrl'
    })
    .state('user.passwordreset', {
      url: '/passwordreset/:token',
      templateUrl: '../app/views/password.reset.html',
      controller: 'resetPasswordCtrl'
    })
    .state('user.registration', {
      url: '/registration',
      templateUrl: '../app/views/twitter.user.html',
      controller: 'twitterCtrl'
    })

    .state('user.cevent', {
      url: '/cevent',
      templateUrl: '../app/views/event.view.html',
      controller: 'eventCtrl'
    })
    .state('user', {
      url: '/user',
      templateUrl: '../app/views/user.view.html',
      controller: 'homeCtrl'
    })
    .state('user.editEvent', {
      url: '/event/:event_id',
      templateUrl: '../app/views/editEvent.view.html',
      controller: 'editeventCtrl'
    })
    .state('user.profile', {
      url: '/profile',
      templateUrl: '../app/views/user.profile.html',
      controller: 'profileCtrl'
    })
    .state('user.eventDetails', {
      url: '/eventdetails/:event_id',
      templateUrl: '../app/views/eventDetails.view.html',
      controller: 'eventCtrl'
    })
    .state('user.moreEvents', {
      url: '/more-events',
      templateUrl: '../app/views/more.events.view.html',
      controller: 'eventCtrl'
    });

  $urlRouterProvider.otherwise('/user/home');
});

angular.module('eventApp')
  .directive("countryList", function() {
    return {
      restrict: 'E',
      scope: {
        ctry: '='
      },
      templateUrl: '../app/views/country.list.html'
    };
  });

angular.module('eventApp')
  .config(function($mdThemingProvider) {
    // Extend the red theme with a few different colors
    var neonRedMap = $mdThemingProvider.extendPalette('red', {
      '500': '000000'
    });
    // Register the new color palette map with the name <code>neonRed</code>
    $mdThemingProvider.definePalette('neonRed', neonRedMap);
    // Use that theme for the primary intentions
    $mdThemingProvider.theme('default')
      .primaryPalette('neonRed')
      .accentPalette('light-blue',{
        'default':'50'
      })
      .warnPalette('red');
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
              if (status == google.maps.GeocoderStatus.OK) {
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
            if (ngModelName.indexOf(".") != -1) {
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