'use strict';
angular.module('eventApp',['ui.router','ngMaterial', 'ngMessages', 'ngResource', 'ngAnimate','ngAria','summernote','ngFileUpload','ngAutocomplete','color.picker','ui.bootstrap','ui.bootstrap.datetimepicker','ngMap'])
  .config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('landing.home',{
      url: '/home',
      templateUrl: '../app/views/home.view.html',
      controller: 'homeCtrl'
    })
    .state('landing', {
      url: '/landing',
      templateUrl: '../app/views/navbar.view.html',
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
      controller: 'eventViewCtrl'
    })
    .state('user.moreEvents', {
      url: '/more-events',
      templateUrl: '../app/views/more.events.view.html',
      controller: 'moreEventsCtrl'
    });

  $urlRouterProvider.otherwise('/landing/home');
});


angular.module('eventApp')
  .config(function($mdThemingProvider) {
    // Extend the red theme with a few different colors
    var neonRedMap = $mdThemingProvider.extendPalette('red', {
      '500': '2f4f4f'
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