'use strict';
angular.module('eventApp',['ui.router','ngMaterial', 'ngMessages', 'ngResource', 'ngAnimate','ngAria', 'ngWYSIWYG'])

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
<<<<<<< HEAD
    .state('user.create', {
      url: '/create',
      templateUrl: '../app/views/create.event.html',
      controller: 'eventCtrl'
    })
    .state('user', {
      url: '/user',
      templateUrl: '../app/views/user.view.html',
      controller: 'homeCtrl'
    }).
    state('user.profile', {
      url: '/profile',
      templateUrl: '../app/views/user.profile.html'
    });

  $urlRouterProvider.otherwise('user/home');
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
