'use strict';
angular.module('eventApp',['ui.router','ngMaterial', 'ngMessages', 'ngResource', 'ngAnimate','ngAria'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home',{
      url: '/home?token',
      templateUrl: '../app/views/home.view.html',
      controller: 'homeCtrl'
    });

  $urlRouterProvider.otherwise('/home');
});