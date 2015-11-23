"use strict";
angular.module('eventApp')
  .controller('eventTaskCtrl', ['$scope', '$stateParams', '$location', 'EventService', 'OrganizerService', 'TaskService', 'VolunteerService', '$rootScope', '$state', '$window', '$q', function($scope, $stateParams, $location, EventService, OrganizerService, TaskService, VolunteerService, $rootScope, $state, $window, $q) {


    $scope.staff = [];
    $scope.searchText = "";
    $scope.event = {};
    $scope.schedule = {};
    $scope.prevVolunteer;

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

                $scope.schedule = {};
                $scope.volunteer = {};
                $scope.pendingVolunteers = [];

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

                VolunteerService.getEventPendingVolunteers($stateParams.event_id).success(function(volunteers) {

                  volunteers.forEach(function(volunteer) {

                    volunteer.skills = volunteer.skills.toString();
                    $scope.pendingVolunteers.push(volunteer);
                  });
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

              $scope.tasks = [];
              $scope.schedule = {};
              $scope.volunteer = {};
              $scope.pendingVolunteers = [];

              //Get all tasks assigned to the task manager
              //which is populated by volunteers' details under each task
              TaskService.getAllUserEventTasks($stateParams.event_id).success(function(tasks) {

                $scope.tasks = tasks;

                var getPendingVolunteersCalls = [];

                //Get list of tasks assigned to a task manager, and pull list of pending volunteers for those tasks
                for (var i = 0; i < tasks.length; i++) {

                  getPendingVolunteersCalls.push(VolunteerService.getTaskPendingVolunteers(tasks[i]._id));

                };


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
      };
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
          newTask.volunteers = [];
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

    $scope.showNewSchedule = function(taskId, volunteer) {

      if ($scope.prevVolunteer) {
        $scope.prevVolunteer.newSchedule = false;
      }

      volunteer.newSchedule = true;
      $scope.prevVolunteer = volunteer;
      $scope.schedule = {};
      $scope.schedule.taskId = taskId;
      $scope.schedule.volunteerId = volunteer.volunteer_ref._id;

    }

    $scope.addNewSchedule = function() {

      //API call to add a schedule
      VolunteerService.addTaskSchedule($scope.schedule.taskId, $scope.schedule.volunteerId, $scope.schedule).success(function(res) {

        //On success assign the id of the newly created schedule to the scope schedule object
        $scope.schedule._id = res._id;

        //Copy the newly created schedule into the schedules array of the volunteer
        $scope.prevVolunteer.volunteer_ref.schedules = $scope.prevVolunteer.volunteer_ref.schedules || [];
        $scope.prevVolunteer.volunteer_ref.schedules.push(angular.copy($scope.schedule));
        $scope.schedule = {};
        //Hide the new schedule fields inside the volunteer box
        $scope.prevVolunteer.newSchedule = false;
        $window.alert('Schedule added');

      }).error(function(err, status) {
        processError(err, status);
      });
    }

    $scope.deleteSchedule = function(volunteer, scheduleId) {

      //API call to delete a volunteer's schedule
      VolunteerService.deleteSchedule(volunteer.volunteer_ref._id, scheduleId).success(function(res) {

        var idx = -1;
        //Navigate through the schedules array of the volunteer object to get and remove the deleted schedule
        for (var k = 0; k < volunteer.volunteer_ref.schedules.length; k++) {

          if (volunteer.volunteer_ref.schedules[k]._id === scheduleId) {

            idx = k;
            break;
          }
        }

        if (idx > -1) {

          volunteer.volunteer_ref.schedules.splice(idx, 1);
          $window.alert('Schedule deleted');
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

    $scope.copySchedule = function(taskId, volunteer, schedule) {

      if ($scope.prevVolunteer) {
        $scope.prevVolunteer.newSchedule = false;
      }

      volunteer.newSchedule = true;
      $scope.prevVolunteer = volunteer;
      $scope.schedule = {};
      $scope.schedule.description = schedule.description;
      $scope.schedule.endDate = schedule.endDate;
      $scope.schedule.startDate = schedule.startDate;
      $scope.schedule.taskId = taskId;
      $scope.schedule.volunteerId = volunteer.volunteer_ref._id;

    }

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

    $scope.userSearch = function(searchText) {

      if (!searchText || searchText === "") {
        return $scope.staff;
      }
      searchText = angular.lowercase(searchText);

      //Filtering with the name variable allows user to search with firstname and lastname combined
      return $scope.staff.filter(function(member) {
        var name = member.firstname + " " + member.lastname;
        return (member.firstname.indexOf(searchText) === 0 || member.lastname.indexOf(searchText) === 0 || name.indexOf(searchText) === 0 || member.email.indexOf(searchText) === 0);
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

    //To determine if the enable volunteer or disable volunteer button to be rendered
    $scope.canDisableVolunteer = function() {
      return $scope.event.enableVolunteer && $scope.role === "owner";
    };

    $scope.canEnableVolunteer = function() {
      return !$scope.event.enableVolunteer && $scope.role === "owner";
    };

    //To switch the volunteer for event mode on/off
    $scope.switchVolunteerMode = function(mode) {

      EventService.switchVolunteerMode($stateParams.event_id, mode).success(function(res) {

        $scope.event.enableVolunteer = mode;
      }).error(function(err, status) {

        processError(err, status);
      });
    };

    function parseDate(date) {
      return new Date(Date.parse(date));
    }

  }]);
