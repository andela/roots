'use strict';
angular.module('eventApp',['ui.router','ngMaterial', 'ngMessages', 'ngResource', 'ngAnimate','ngAria'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home',{
      url: '/home',
      templateUrl: '../app/views/home.view.html',
      controller: 'homeCtrl'
    })
    .state('passwordreset', {
      url: '/passwordreset/:token',
      templateUrl: '../app/views/password.reset.html',
      controller: 'resetPasswordCtrl'
    })
    .state('registration', {
      url: '/registration',
      templateUrl: '../app/views/twitter.user.html',
      controller: 'twitterCtrl'
    });

  $urlRouterProvider.otherwise('/home');
});