"use strict";
angular.module('eventApp')
  .controller('eventTaskCtrl', ['$scope', '$stateParams', '$location', 'EventService', 'OrganizerService', 'TaskService', 'VolunteerService', '$rootScope', '$state', '$window', '$q', function($scope, $stateParams, $location, EventService, OrganizerService, TaskService, VolunteerService, $rootScope, $state, $window, $q) {


    $scope.staff = [];
    $scope.searchText = "";

    $scope.newTask = {

    };

    //Initialize the task manager page with the applicaple event tasks' data
    //based on the role of the user viewing the page
    $scope.services = function() {
      if (!localStorage.getItem('userToken')) {
        $location.url('/home');
      } else {
        EventService.getEvent($stateParams.event_id)
          .success(function(event) {
            $scope.event = event.details;

            $scope.role = event.role;

            //If page is viewed by event manager
            if ($scope.isEventOwner()) {

              //Get all tasks created for the event
              TaskService.getAllTasks($stateParams.event_id).success(function(tasks) {

                var user;

                //Map task with task manager user details for 
                //easy mapping on the frontend
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
                //Load all the team members of the event manager's organizer profile
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
              //If event is viewed by an event task manager
            } else if ($scope.isTaskManager()) {

              $scope.volunteers = [];
              $scope.tasks = [];
              $scope.schedule = {};
              $scope.volunteer = {};
              $scope.pendingVolunteers = [];

              //Get all tasks assigned to the task manager
              //which is populated by volunteers' details under each task
              TaskService.getAllUserEventTasks($stateParams.event_id).success(function(tasks) {

                $scope.tasks = tasks;

                var getPendingVolunteersCalls = [];

                //Get all volunteers under manager's tasks, and add matching task(department)
                //details to each volunteer object, before adding the volunteer objects
                //to the scope volunteers array, from which a task manager can select a volunteer
                //to assign a schedule
                for (var i = 0; i < tasks.length; i++) {

                  for (var j = 0; j < tasks[i].volunteers.length; j++) {
                    var volunteer = {};
                    volunteer = angular.copy(tasks[i].volunteers[j].volunteer_ref);
                    volunteer.task = angular.lowercase(tasks[i].description);
                    volunteer.taskId = tasks[i]._id;
                    volunteer.user_ref.firstname = angular.lowercase(volunteer.user_ref.firstname);
                    volunteer.user_ref.lastname = angular.lowercase(volunteer.user_ref.lastname);
                    $scope.volunteers.push(volunteer);
                  }

                  getPendingVolunteersCalls.push(VolunteerService.getTaskPendingVolunteers(tasks[i]._id));
                }

                //Get list of users who have volunteered for any of the
                //manager's tasks, but not added yet to the event
                $q.all(getPendingVolunteersCalls).then(function(data) {

                  data.forEach(function(volunteers) {

                    volunteers.data.forEach(function(volunteer) {
                      volunteer.skills = volunteer.skills.toString();
                      $scope.pendingVolunteers.push(volunteer);
                    });
                  });
                });

                $scope.searchLabel = $scope.volunteers.length ? "Select volunteer to assign task" : "No volunteer found";

              });

              //If viewed by a task volunteer
            } else if ($scope.isVolunteer()) {
              $scope.volunteers = [];

              //Get list of volunteer's task schedules
              VolunteerService.getAllMyEventVolunteers($stateParams.event_id).success(function(volunteers) {

                $scope.volunteers = volunteers;
              });

            }
          });
      }
    };

    $rootScope.hideBtn = false;

    $scope.addTask = function() {

      if ($scope.newTask.startDate > $scope.newTask.endDate) {
        $window.alert('invalid date range');
        return;
      }
      //Create an event task and assign it to a team member
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

      //Delete an event task
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
      //Edit event task
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

    //Add a volunteer to an event task
    $scope.addVolunteerToTask = function(volunteer) {
      VolunteerService.addVolunteerToTask(volunteer.task_ref._id, volunteer._id).success(function(res) {

        volunteer.added = true;
        volunteer.task_ref = volunteer.task_ref._id;

        for (var i = 0; i < $scope.tasks.length; i++) {

          if ($scope.tasks[i]._id === volunteer.task_ref) {


            $scope.tasks[i].volunteers.push({
              volunteer_ref: volunteer
            });

            //Add matching task(department)
            //details to the volunteer object, before adding the volunteer object
            //to the scope volunteers array, from which a task manager can select a volunteer
            //to assign a schedule
            var selectedVolunteer = angular.copy(volunteer);

            selectedVolunteer.task = angular.lowercase($scope.tasks[i].description);
            selectedVolunteer.taskId = $scope.tasks[i]._id;
            selectedVolunteer.user_ref.firstname = angular.lowercase(selectedVolunteer.user_ref.firstname);
            selectedVolunteer.user_ref.lastname = angular.lowercase(selectedVolunteer.user_ref.lastname);
            $scope.volunteers.push(selectedVolunteer);

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
      VolunteerService.removeVolunteerFromTask(taskId, volunteerId).success(function(res) {

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

      //API call to add a schedule
      VolunteerService.addTaskSchedule($scope.volunteer.taskId, $scope.volunteer._id, $scope.schedule).success(function(res) {

        //On success assign the id of the newly created schedule to the scope schedule object
        $scope.schedule._id = res._id;

        //Add a schedule to the volunteer selected from the auto complete field
        //Navigate through the tasks array to get which task(department) the volunteer is assigned to
        for (var i = 0; i < $scope.tasks.length; i++) {

          if ($scope.tasks[i]._id === $scope.volunteer.taskId) {

            var idx = -1;
            //Navigate through the volunteers array of the matching task
            //to retrieve the actual volunteer object in the tasks array
            for (var j = 0; j < $scope.tasks[i].volunteers.length; j++) {

              if ($scope.tasks[i].volunteers[j].volunteer_ref._id === $scope.volunteer._id) {

                //Initialize the volunteer's schedule field with [] if it is undefined
                $scope.tasks[i].volunteers[j].volunteer_ref.schedules = $scope.tasks[i].volunteers[j].volunteer_ref.schedules || [];

                //Push the newly created schedule details to the schedules array of the volunteer object
                $scope.tasks[i].volunteers[j].volunteer_ref.schedules.push(angular.copy($scope.schedule));
                $scope.schedule = {};
                $scope.volunteer = {};
                $window.alert('Schedule added');
                break;
              }
            }
            break;
          }
        }

      }).error(function(err, status) {

        processError(err, status);
      });
    };

    $scope.deleteSchedule = function(taskId, volunteerId, scheduleId) {

      //API call to delete a volunteer's schedule
      VolunteerService.deleteSchedule(volunteerId, scheduleId).success(function(res) {
        //Navigate through the tasks array to get which task(department) the volunteer is assigned to 
        for (var i = 0; i < $scope.tasks.length; i++) {

          if ($scope.tasks[i]._id === taskId) {

            var idx = -1;

            //Navigate through the volunteers array of the task object to get the volunteer object from the tasks array
            for (var j = 0; j < $scope.tasks[i].volunteers.length; j++) {

              if ($scope.tasks[i].volunteers[j].volunteer_ref._id === volunteerId) {

                var idx = -1;
                //Navigate through the schedules array of the volunteer object to get and remove the deleted schedule
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
            break;
          }
        }

      }).error(function(err, status) {

        processError(err, status);
      });
    };

    $scope.editSchedule = function(volunteerId, scheduleId, schedule) {
      VolunteerService.editSchedule(volunteerId, scheduleId, schedule).success(function(res) {

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

    $scope.selectedUserChange = function(user) {
      $scope.newTask = angular.extend({}, user);

    };

    $scope.selectedVolunteerChange = function(volunteer) {
      $scope.volunteer = angular.extend({}, volunteer);

    };


    $scope.volunteerSearch = function(searchText) {

      if (!searchText || searchText === "") {
        return $scope.volunteers;
      }
      searchText = angular.lowercase(searchText);

      return $scope.volunteers.filter(function(volunteer) {

        return (volunteer.user_ref.firstname.indexOf(searchText) === 0 || volunteer.user_ref.lastname.indexOf(searchText) === 0 || volunteer.user_ref.email.indexOf(searchText) === 0);
      });
    };

    $scope.userSearch = function(searchText) {

      if (!searchText || searchText === "") {
        return $scope.staff;
      }
      searchText = angular.lowercase(searchText);

      return $scope.staff.filter(function(member) {

        return (member.firstname.indexOf(searchText) === 0 || member.lastname.indexOf(searchText) === 0 || member.email.indexOf(searchText) === 0);
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

    function parseDate(date) {
      return new Date(Date.parse(date));
    }

  }]);
