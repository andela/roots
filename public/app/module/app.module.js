'use strict';
angular.module('eventApp',['ui.router','ngMaterial', 'ngMessages', 'ngResource', 'ngAnimate','ngAria','summernote','ngFileUpload','ngAutocomplete','color.picker'])
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
      templateUrl: '../app/views/user.profile.html'
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
