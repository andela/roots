"use strict";
angular.module('eventApp')
  .controller('eventViewCtrl', ['$scope', '$stateParams', '$location', 'EventService', 'OrganizerService', '$rootScope', '$state', '$sce', 'VolunteerService', '$mdDialog', 'TaskService', '$mdToast', function($scope, $stateParams, $location, EventService, OrganizerService, $rootScope, $state, $sce, VolunteerService, $mdDialog, TaskService, $mdToast) {

    $scope.event = {};
    $scope.tasks = [];

    $scope.services = function() {

      EventService.getEvent($stateParams.event_id)
        .success(function(event) {
          $scope.event = event.details;
          $scope.role = event.role;

          $scope.event.description = $sce.trustAsHtml($scope.event.description);

          $('.md-warn').css('background-color', $scope.event.eventTheme.headerColor);
          $('.md-warn').css('color', $scope.event.eventTheme.fontColor);
          $('.values').css('border-color', $scope.event.eventTheme.borderColor);
          $('.values').css('background-color', $scope.event.eventTheme.contentColor);
          $('.values').css('color', $scope.event.eventTheme.fontColor);
         
          if ($scope.event.user_ref.organizer_ref) {

            OrganizerService.getOrganizer($scope.event.user_ref.organizer_ref)
              .success(function(organizer) {
                $scope.organizer = organizer;
                $scope.organizer.phoneNumber1 = $scope.event.user_ref.phoneNumber1;
              });
          }

          //API call to retrieve all event tasks
          //So as to hide or show the volunteer for event button depending on if there is any event tasks
          TaskService.getAllTasks($stateParams.event_id).then(function(tasks){
            if (tasks) {
              $scope.tasks = tasks.data;

              //departments global variable holds event tasks so that it can be referenced in the controller for volunteer for event dialog box, avoiding need to make another getAllTasks API call
              departments = $scope.tasks;
            }
          });
        });
    };

    $rootScope.hideBtn = false;
    var departments;
    $scope.event = {};
    $scope.tasks = {};

    
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

        $scope.tasks = departments;    

        $scope.volunteerForTask = function(volunteer) {
          
          VolunteerService.volForTask(volunteer).success(function(res){

            $mdToast.show(
            $mdToast.simple()
              .content('You have successfully volunteered!')
              .hideDelay(4000)
              .position("bottom right")
            );
            $mdDialog.hide();
            document.body.scrollTop = document.documentElement.scrollTop = 0;
          }).error(function(err, status){

            processError(err, status);
          });
          
        };
      }

      $scope.manageTasks = function() {
        $state.go('user.eventTasks', {
          event_id: $stateParams.event_id

        });
      };

    $scope.isEventOwner = function() {
      return $scope.role === "owner";
    };

    $scope.isTaskManager = function() {
      return $scope.role === "manager";
    };

    $scope.isVolunteer = function() {
      return $scope.role === "volunteer";
    };

    $scope.canPublish = function() {
      return $scope.role === "owner" && !$scope.event.online;
    };

    $scope.canManageTasks = function() {
      return $scope.role === "owner" && $scope.event.user_ref.organizer_ref;
    };

    $scope.viewTasks = function() {
      $state.go('user.eventTasks', {
        event_id: $stateParams.event_id
      });
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    };

    //To determine if the volunteer for event button should be rendered
    $scope.volunteerEnabled = function() {
      return $scope.event.enableVolunteer && $scope.tasks.length;
    };

    function processError(err, status) {

      if (Number(status) === 422 || Number(status) === 401 || Number(status) === 403) {        

        $mdToast.show(
          $mdToast.simple()
            .content(err.message)
            .hideDelay(4000)
            .position("bottom right")
          );
          $mdDialog.hide();
          document.body.scrollTop = document.documentElement.scrollTop = 0;
      } else {

         $mdToast.show(
          $mdToast.simple()
            .content("An error just occured, please try again!")
            .hideDelay(4000)
            .position("bottom right")
          );
          $mdDialog.hide();
          document.body.scrollTop = document.documentElement.scrollTop = 0;       
      }
    }
  }]);
