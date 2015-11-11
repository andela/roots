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

              $scope.role = event.role;

              if ($scope.isEventOwner()) {

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

                  $scope.searchLabel = $scope.staff.length ? "Search team member and assign task..." : "Add team members to organizer profile"
                });
              } else if ($scope.isTaskManager()) {

                $scope.volunteers = [];
                $scope.tasks = [];
                $scope.schedule = {};
                $scope.volunteer = {};
                $scope.pendingVolunteers = [];

                TaskService.getAllUserEventTasks($stateParams.event_id).success(function(tasks) {

                  $scope.tasks = tasks;

                  for (var i = 0; i < tasks.length; i++) {

                    for (var j = 0; j < tasks.volunteers.length; j++) {
                      var volunteer = {};
                      volunteer = angular.copy(tasks[i].volunteers[j].volunteer_ref);
                      volunteer.task = angular.lowercase(tasks[i].description);
                      volunteer.taskId = tasks[i]._id;
                      volunteer.user_ref.firstname = angular.lowercase(volunteer.user_ref.firstname);
                      volunteer.user_ref.lastname = angular.lowercase(volunteer.user_ref.lastname);
                      $scope.volunteers.push(volunteer);
                    }
                  }

                  TaskService.getEventPendingVolunteers($stateParams.event_id).success(function(volunteers) {

                    $scope.pendingVolunteers = volunteers;
                  });
                });

          } else if ($scope.isVolunteer()) {
            $scope.volunteers = [];
            TaskService.getAllMyEventVolunteers($stateParams.event_id).success(function(volunteers) {

              $scope.volunteers = volunteers;
            });

          }
        });
      };
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

    $scope.addVolunteerToTask = function(volunteer) {
      TaskService.addVolunteerToTask(volunteer.task_ref._id, volunteer._id).success(function(res) {

        volunteer.added = true;
        volunteer.task_ref = volunteer.task_ref._id;

        for (var i = 0; i < $scope.tasks.length; i++) {

          if ($scope.tasks[i]._id === volunteer.task_ref) {


            $scope.tasks[i].push({
              volunteer_ref: volunteer
            });

            var volunteerListItem = angular.copy(volunteer);

            volunteerListItem.task = angular.lowercase($scope.tasks[i].description);
            volunteerListItem.taskId = $scope.tasks[i]._id;
            volunteerListItem.user_ref.firstname = angular.lowercase(volunteerListItem.user_ref.firstname);
            volunteerListItem.user_ref.lastname = angular.lowercase(volunteerListItem.user_ref.lastname);
            $scope.volunteers.push(volunteerListItem);

            var idx = -1;
            for (var j = 0; j < $scope.pendingVolunteers.length; j++) {

              if ($scope.pendingVolunteers[j]._id === volunteer._id) {

                idx = j;
                break;
              }
            }

            if (idx > -1) {

              $scope.pendingVolunteers.splice(idx, 1);
            }

            break;
          }
        }
        $window.alert('Volunteer added.');
      }).error(function(err, status) {

        processError(err, status);
      });
    };


    $scope.removeVolunteerFromTask = function(taskId, volunteerId, added) {
      TaskService.removeVolunteerFromTask(taskId, volunteerId).success(function(res) {

        if (added) {

          var idx = -1;
          for (var i = 0; i < $scope.tasks.length; i++) {

            if ($scope.tasks[i]._id === taskId) {

              for (var j = 0; j < $scope.tasks[i].volunteers.length; j++) {
                if ($scope.tasks[i].volunteers[j].volunteer_ref._id === volunteerId) {
                  idx = j;
                  break;
                }
              }

              if (idx > -1) {

                $scope.tasks[i].volunteers.splice(idx, 1);
              }

              break;
            }
          }

          idx = -1;

          for (var i = 0; i < $scope.volunteers.length; i++) {

            if ($scope.volunteers[i]._id === volunteerId) {

              idx = i;

              break;
            }

          }

          if (idx > -1) {

            $scope.volunteers.splice(idx, 1);
          }

        } else {

          var idx = -1;

          for (var i = 0; i < $scope.pendingVolunteers.length; i++) {

            if ($scope.pendingVolunteers[i]._id === volunteerId) {

              idx = i;

              break;
            }

          }

          if (idx > -1) {

            $scope.pendingVolunteers.splice(idx, 1);
          }

        }

        $window.alert('Volunteer removed!');

      }).error(function(err, status) {

        processError(err, status);
      });
    };

    $scope.addTaskSchedule = function() {
      TaskService.addTaskSchedule($scope.volunteer.taskId, $scope.volunteer._id, $scope.schedule).success(function(res) {

        for (var i = 0; i < $scope.tasks.length; i++) {

          if ($scope.tasks[i]._id === $scope.volunteer.taskId) {

            var idx = -1;

            for (var j = 0; j < $scope.tasks[i].volunteers.length; j++) {

              if ($scope.tasks[i].volunteers[j].volunteer_ref._id === $scope.volunteer._id) {

                $scope.tasks[i].volunteers[j].volunteer_ref.schedules = $scope.tasks[i].volunteers[j].volunteer_ref.schedules || [];

                $scope.tasks[i].volunteers[j].volunteer_ref.schedules.push(angular.copy($scope.schedule));
                $scope.schedule = {};
                $scope.volunteer = {};
                $window.alert('Schedule added');
                break;
              }
            }
          }

          break;
        }

      }).error(function(err, status) {

        processError(err, status);
      });
    }

    $scope.deleteSchedule = function(taskId, volunteerId, scheduleId) {
      TaskService.deleteSchedule(volunteerId, scheduleId).success(function(res) {

        for (var i = 0; i < $scope.tasks.length; i++) {

          if ($scope.tasks[i]._id === taskId) {

            var idx = -1;

            for (var j = 0; j < $scope.tasks[i].volunteers.length; j++) {

              if ($scope.tasks[i].volunteers[j].volunteer_ref._id === volunteerId) {

                var idx = -1;
                for (var k = 0; k < $scope.tasks[i].volunteers[j].volunteer_ref.schedules.length; k++) {

                  if ($scope.tasks[i].volunteers[j].volunteer_ref.schedules[k]._id === scheduleId) {

                    idx = k;
                    break;
                  }
                }

                if (idx > -1) {

                  $scope.tasks[i].volunteers[j].volunteer_ref.schedules.splice(idx, 1);
                  $window.alert('Schedule deleted');
                }
                break;
              }
            }
          }

          break;
        }

      }).error(function(err, status) {

        processError(err, status);
      });
    };

    $scope.editSchedule = function(volunteerId, scheduleId, schedule) {
      TaskService.editSchedule(volunteerId, scheduleId, schedule).success(function(res) {

        $window.alert('Schedule modified.');

      }).error(function(err, status) {

        processError(err, status);
      });
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

    $scope.selectedUserChange = function(volunteer) {
      $scope.volunteer = angular.extend({}, volunteer);

    };


    $scope.querySearch = function(searchText) {

      if (!searchText || searchText === "") {
        return $scope.volunteers;
      }
      searchText = angular.lowercase(searchText);

      return $scope.volunteers.filter(function(volunteer) {

        return (volunteer.user_ref.firstname.indexOf(searchText) === 0 || volunteer.user_ref.lastname.indexOf(searchText) === 0 || volunteer.user_ref.email.indexOf(searchText) === 0);
      });
    };

    $scope.searchLabel = function() {
      return $scope.volunteers.length ? "Select volunteer to assign task" : "No volunteer found";
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

    function parseDate(date) {
      return new Date(Date.parse(date));
    }

  }]);
