'use strict';
angular.module('eventApp',['ui.router','ngMaterial', 'ngAnimate','ngAria', 'textAngular'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home',{
      url: '/home',
      templateUrl: '../app/views/home.view.html',
      controller: 'homeCtrl'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: '../app/views/signup.view.html'
    });

  $urlRouterProvider.otherwise('/home');
});