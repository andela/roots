"use strict";
angular.module('eventApp')
  .controller('profileCtrl', ['$scope', '$rootScope', 'EventService', 'OrganizerService', 'Upload', 'UserService', '$state', '$window', function($scope, $rootScope, EventService, OrganizerService, Upload, UserService, $state, $window) {


    if (!localStorage.getItem('userToken')) {
      $location.url('/home');
    } else {

      $rootScope.hideBtn = false;

      $scope.userEditMode = false;
      $scope.organizerEditMode = true;
      $scope.orgProfileExists = false;

      $scope.tempUserProfile;
      $scope.tempOrgProfile;
      $scope.organizer = {};
      $scope.staff = [];
      $scope.searchText = "";
      $scope.users = [];
      $scope.newStaff = {
        name: '',
        email: '',
        role: ''
      };

      UserService.getCurrentUser().success(function(res) {

        if (res.organizer_ref) {
          $scope.organizer = res.organizer_ref;
          $scope.organizerEditMode = false;
          $scope.orgProfileExists = true;
        }

        $scope.userInformation = res;
        if (!res.profilePic) {
          $scope.userInformation.profilePic = "../../assets/img/icons/default-avatar.png";
        }
        $scope.syncGenderDateDet();
      }).error(function(err, status) {
        processError(err, status);
      });


      //Retrieve organizer staff members
      if ($scope.organizer) {
        OrganizerService.getMyProfile().success(function(res) {

          var filtered;

          $scope.staff = res.staff.map(function(member) {
            filtered = {};
            filtered.id = member._id;
            filtered.managerId = member.manager_ref._id;
            filtered.firstname = member.manager_ref.firstname;
            filtered.lastname = member.manager_ref.lastname;
            filtered.email = member.manager_ref.email;
            filtered.role = member.role;
            return filtered;
          });

        }).error(function(err, status) {
          processError(err, status);
        });
      }

      UserService.getAllUsers().success(function(res) {

        $scope.users = res.map(function(user) {

          user.firstname = angular.lowercase(user.firstname);
          user.lastname = angular.lowercase(user.lastname);
          user.email = angular.lowercase(user.email);
          return user;
        });


      }).error(function(err, status) {
        processError(err, status);
      });

      EventService.getMyPublishedEvents().success(function(res) {
        $scope.publishedEvents = res;

      }).error(function(err, status) {
        processError(err, status);
      });

      EventService.getMyEventDrafts().success(function(res) {
        $scope.eventDrafts = res;

      }).error(function(err, status) {
        processError(err, status);
      });

    }

    $scope.organizerButtnSave = function() {

      if (!$scope.organizer.name) {
        $window.alert("Name field is mandatory!");
        return;
      }

      if ($scope.orgProfileExists) {
        $scope.editOrganizer();
      } else {
        $scope.registerOrganizer();
      }
    };

    $scope.registerOrganizer = function() {

      OrganizerService.createProfile($scope.organizer)
        .success(function(res) {
          $scope.userInformation.organizer_ref = res._id;
          $scope.organizer = res;
          $scope.organizerEditMode = false;
          $scope.orgProfileExists = true;

        }).error(function(err, status) {
          processError(err, status);
        });
    };

    $scope.addTeamMember = function() {

      OrganizerService.addTeamMember($scope.organizer._id, {
          manager_ref: $scope.newStaff._id,
          role: $scope.newStaff.role
        })
        .success(function(res) {
          var newStaff = angular.copy($scope.newStaff);
          newStaff.id = res._id;
          newStaff.managerId = newStaff._id;
          $scope.staff.push(newStaff);
          $scope.newStaff = {};
          $window.alert("Team member added!");

        }).error(function(err, status) {
          processError(err, status);
        });
    };

    $scope.deleteTeamMember = function(memberId) {

      OrganizerService.deleteTeamMember($scope.organizer._id, memberId)
        .success(function(res) {
          
          var idx = -1;
          for(var i=0; i<$scope.staff.length; i++){

            if($scope.staff[i].id.toString()===memberId.toString()){

              idx = i;
              break;
            }
          }

          if(idx !== -1){
            $scope.staff.splice(idx, 1);
          }

          $window.alert("Team member deleted!");

        }).error(function(err, status) {
          processError(err, status);
        });
    };


    $scope.editMemberRole = function(memberId, role) {

      OrganizerService.editMemberRole($scope.organizer._id, memberId, {newRole: role})
        .success(function(res) {
          
          $window.alert("Role changed!");

        }).error(function(err, status) {
          processError(err, status);
        });
    };

    $scope.editOrganizer = function() {

      OrganizerService.editProfile($scope.organizer)
        .success(function(res) {

          $scope.organizer = res;
          $scope.organizerEditMode = false;
        }).error(function(err, status) {

          processError(err, status);
        });
    };

    $scope.deleteOrganizer = function() {

      OrganizerService.deleteProfile()
        .success(function(res) {

          $scope.organizerEditMode = true;
          $scope.orgProfileExists = false;
          $scope.userInformation.organizer_ref = undefined;
          $scope.organizer = {};
          $scope.organizer.newImage = undefined;

        }).error(function(err, status) {
          processError(err, status);
        });
    };

    $scope.updateUser = function() {

      if (!$scope.userInformation.firstname || !$scope.userInformation.lastname || !$scope.userInformation.email) {
        $window.alert("Fill all mandatory fields!");
        return;
      }

      UserService.editProfile($scope.userInformation)
        .success(function(res) {
          localStorage.setItem('userToken', res.token);
          UserService.decodeUser();

          $scope.userInformation = res.user;
          $scope.syncGenderDateDet();
          $scope.userEditMode = false;

        }).error(function(err, status) {
          processError(err, status);
        });
    };

    $scope.uploadPicture = function() {

      if (!$scope.userInformation.newImage) {
        $window.alert("Choose a photo to upload!");
        return;
      }

      UserService.uploadPicture({
          newImage: $scope.userInformation.newImage
        })
        .success(function(res) {
          localStorage.setItem('userToken', res.token);
          UserService.decodeUser();
          $scope.userInformation.profilePic = res.user.profilePic;

          $scope.userEditMode = false;

        }).error(function(err, status) {
          processError(err, status);
        });
    };

    $scope.previewImg = function(inElement, prevElement) {
      $(inElement).on('change', function() {
        var preview = document.querySelector(prevElement);
        var file = document.querySelector(inElement).files[0];
        var reader = new FileReader();
        reader.onloadend = function() {
          preview.src = reader.result;
        };
        if (file) {
          reader.readAsDataURL(file);
        } else {
          preview.src = "";
        }
      });
    };

    $scope.switchUserEditMode = function(mode) {
      $scope.userEditMode = mode;

      $scope.userInformation.newImage = undefined;

      if (mode) {
        $scope.tempUserProfile = angular.copy($scope.userInformation);
      } else {
        $scope.userInformation = angular.copy($scope.tempUserProfile);
      }
    };

    $scope.switchOrganizerEditMode = function(mode) {
      $scope.organizerEditMode = mode;
      $scope.organizer.newImage = undefined;
      if (mode) {

        $scope.tempOrgProfile = angular.copy($scope.organizer);
      } else {
        $scope.organizer = angular.copy($scope.tempOrgProfile);

      }
    };

    $scope.syncGenderDateDet = function() {

      if (angular.lowercase($scope.userInformation.gender) === "m") {

        $scope.userInformation.genderDet = "Male";
      } else if (angular.lowercase($scope.userInformation.gender) === "f") {
        $scope.userInformation.genderDet = "Female";
      } else {
        $scope.userInformation.genderDet = $scope.userInformation.gender;
      }

      $scope.userInformation.dobDet = parseDate($scope.userInformation.dateOfBirth);

      if($scope.userInformation.dobDet.indexOf("-") === 1){
        $scope.userInformation.dobDet = '0' + $scope.userInformation.dobDet;
      }

       if($scope.userInformation.dobDet.lastIndexOf("-") === 4){
        $scope.userInformation.dobDet = $scope.userInformation.dobDet.substring(0, 3) + '0' + $scope.userInformation.dobDet.substring(3);
      }

    };

    $scope.editEvent = function(eventId) {

      $state.go('user.editEvent', {
        event_id: eventId
      });
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    };

    $scope.viewEvent = function(eventId) {

      $state.go('user.eventDetails', {
        event_id: eventId
      });
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    };


    $scope.deleteEvent = function(eventId, events) {

      EventService.deleteEvent(eventId)
        .success(function() {
          for (var i = 0; i < events.length; i++) {

            if (events[i]._id === eventId) {
              events.splice(i, 1);
              break;
            }
          }
        });
    };


    function parseDate(date) {
      if (!date) {
        return "";
      }
      var dateObj = new Date(Date.parse(date));
      var dateString = (Number(dateObj.getMonth()) + 1) + "-" + dateObj.getDate() + "-" + dateObj.getFullYear();
      return dateString;
    }

    function processError(err, status) {

      if (Number(status) === 422 || Number(status) === 401 || Number(status) === 403) {
        $window.alert(err.message);
      } else {
        $window.alert("An error just occured, please try again!");
      }
    }



    $scope.selectedUserChange = function(user) {
      $scope.newStaff = angular.extend({}, user);

    }


    $scope.querySearch = function(searchText) {

      if (!searchText || searchText === "") {
        return $scope.users;
      }
      searchText = angular.lowercase(searchText);

      return $scope.users.filter(function(user) {

        return (user.firstname.indexOf(searchText) === 0 || user.lastname.indexOf(searchText) === 0 || user.email.indexOf(searchText) === 0);
      });
    }

  }]);
