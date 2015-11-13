"use strict";
angular.module('eventApp')
  .controller('eventTaskCtrl', ['$scope', '$stateParams', '$location', 'EventService', 'OrganizerService', 'TaskService', '$rootScope', '$state', '$window', function($scope, $stateParams, $location, EventService, OrganizerService, TaskService, $rootScope, $state, $window) {


    $scope.staff = [];
    $scope.searchText = "";

    $scope.newTask = {

    };


    $scope.services = function() {
      if (!localStorage.getItem('userToken')) {
        $location.url('/home');
      } else {
        EventService.getEvent($stateParams.event_id)
          .success(function(event) {
            $scope.event = event.details;


            TaskService.getAllTasks($stateParams.event_id).success(function(tasks) {

              var user;

              $scope.tasks = tasks.map(function(task) {

                user = angular.extend({}, task.manager_ref);
                task.manager_ref = user._id;
                task.firstname = user.firstname;
                task.lastname = user.lastname;
                task.email = user.email;
                task.startDate = parseDate(task.startDate);
                task.endDate = parseDate(task.endDate);

                return task;
              });
            });



            OrganizerService.getMyProfile().success(function(res) {

              var filtered;

              $scope.staff = res.staff.map(function(member) {
                filtered = {};
                filtered.memberId = member._id;
                filtered.manager_ref = member.manager_ref._id;
                filtered.firstname = angular.lowercase(member.manager_ref.firstname);
                filtered.lastname = angular.lowercase(member.manager_ref.lastname);
                filtered.email = angular.lowercase(member.manager_ref.email);
                filtered.profilePic = member.manager_ref.profilePic;
                filtered.description = member.role;
                return filtered;
              });

              $scope.searchLabel = $scope.staff.length ? "Search team member and assign task..." : "Add team members to organizer profile";
            });
          });
      }
    };

    $rootScope.hideBtn = false;

    $scope.addTask = function() {

      if ($scope.newTask.startDate > $scope.newTask.endDate) {
        $window.alert('invalid date range');
        return;
      }

      TaskService.createTask($stateParams.event_id, {
          newTask: $scope.newTask
        })
        .success(function(res) {
          var newTask = angular.copy($scope.newTask);
          newTask._id = res._id;
          $scope.tasks.push(newTask);
          $scope.newTask = {};
          $window.alert("Task added!");

        }).error(function(err, status) {
          processError(err, status);
        });
    };

    $scope.deleteTask = function(taskId) {

      TaskService.deleteTask($stateParams.event_id, taskId)
        .success(function(res) {

          var idx = -1;
          for (var i = 0; i < $scope.tasks.length; i++) {

            if ($scope.tasks[i]._id.toString() === taskId.toString()) {

              idx = i;
              break;
            }
          }

          if (idx !== -1) {
            $scope.tasks.splice(idx, 1);
          }

          $window.alert("Task deleted!");

        }).error(function(err, status) {
          processError(err, status);
        });
    };


    $scope.editTask = function(task) {

      if (task.startDate > task.endDate) {
        $window.alert('invalid date range');
        return;
      }

      TaskService.editTask($stateParams.event_id, task._id, {
          newTask: task
        })
        .success(function(res) {

          $window.alert("Task modified!");

        }).error(function(err, status) {          
          processError(err, status);
        });
    };

    $scope.viewEvent = function() {
      $state.go('user.eventDetails', {
        event_id: $stateParams.event_id
      });
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    };

    function processError(err, status) {

      if (Number(status) === 422 || Number(status) === 401 || Number(status) === 403) {
        $window.alert(err.message);
      } else {
        $window.alert("An error just occured, please try again!");
      }
    }



    $scope.selectedUserChange = function(user) {
      $scope.newTask = angular.extend({}, user);

    };


    $scope.querySearch = function(searchText) {

      if (!searchText || searchText === "") {
        return $scope.staff;
      }
      searchText = angular.lowercase(searchText);

      return $scope.staff.filter(function(user) {

        return (user.firstname.indexOf(searchText) === 0 || user.lastname.indexOf(searchText) === 0 || user.email.indexOf(searchText) === 0);
      });
    };

    function parseDate(date) {
      return new Date(Date.parse(date));
    }

  }]);
