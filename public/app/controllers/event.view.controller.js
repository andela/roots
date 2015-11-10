"use strict";
angular.module('eventApp')
  .controller('eventViewCtrl', ['$scope', '$stateParams', '$location', 'EventService', 'OrganizerService', '$rootScope', '$state', '$sce', 'VolunteerService', '$mdDialog', 'TaskService', '$mdToast', function($scope, $stateParams, $location, EventService, OrganizerService, $rootScope, $state, $sce, VolunteerService, $mdDialog, TaskService, $mdToast) {

      $scope.services = function(){

        EventService.getEvent($stateParams.event_id)
          .success(function(event){
            $scope.event = event.details;           
            $scope.role = event.role;

            $scope.event.description = $sce.trustAsHtml($scope.event.description);

            $('.md-warn').css('background-color', $scope.event.eventTheme.headerColor);
            $('.md-warn').css('color', $scope.event.eventTheme.fontColor);
            $('.values').css('border-color', $scope.event.eventTheme.borderColor);
            $('.values').css('background-color', $scope.event.eventTheme.contentColor);
            $('.values').css('color', $scope.event.eventTheme.fontColor);

            $scope.canPublish = ($scope.role === "owner") && !$scope.event.online;

            $scope.canEdit = $scope.role === "owner";

            $scope.canManageTasks = $scope.role === "owner" && $scope.event.user_ref.organizer_ref;
            if ($scope.event.user_ref.organizer_ref) {

              OrganizerService.getOrganizer($scope.event.user_ref.organizer_ref)
                .success(function(organizer) {                
                  $scope.organizer = organizer;
                  $scope.organizer.phoneNumber1 = $scope.event.user_ref.phoneNumber1;
                });
            }
          });
      };

      $rootScope.hideBtn = false;

      $scope.editEvent = function() {
        $state.go('user.editEvent', {
          event_id: $stateParams.event_id
        });
        document.body.scrollTop = document.documentElement.scrollTop = 0;
      };

      $scope.deleteEvent = function(){
        EventService.deleteEvent($stateParams.event_id);
        $location.url('/home');
      };

      $scope.publishEvent = function() {
        EventService.publishEvent($stateParams.event_id)
          .success(function(data) {
            $scope.canPublish = false;          
          });
      };
      
      $scope.showTasks = function(){
        $mdDialog.show({
          clickOutsideToClose: true,
          controller: displayTasks,
          locals: {
            view: 'taskList'
          },
          templateUrl: "app/views/taskList.view.html"
        });
      };

      function displayTasks($scope, $mdDialog, $mdToast){
        TaskService.getAllTasks($stateParams.event_id).then(function(tasks){
          if (tasks) {
            $scope.tasks = tasks.data;
          }
        });

        $scope.volunteerForTask = function(volunteer) {
          VolunteerService.volForTask(volunteer);
          $mdToast.show(
            $mdToast.simple()
              .content('You have successfully volunteered!')
              .hideDelay(4000)
              .position("bottom right")
          );
          $mdDialog.hide();
          document.body.scrollTop = document.documentElement.scrollTop = 0;
        };
      }

      $scope.manageTasks = function() {
        $state.go('user.eventTasks', {
          event_id: $stateParams.event_id
        });
        document.body.scrollTop = document.documentElement.scrollTop = 0;
      };
  }]);
