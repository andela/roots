
var App = angular.module('eventApp',['ui.router', 'textAngular']);

App.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home',{
      url: '/home',
      templateUrl: '../app/views/home.view.html'
    });

  $urlRouterProvider.otherwise('/home');
});