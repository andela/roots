'use strict';

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

      UserService.getCurrentUser().success(function(res) {
        $scope.organizer = res.organizer_ref;

        if ($scope.organizer) {
          $scope.organizerEditMode = false;
          $scope.orgProfileExists = true;
        }

        $scope.userInformation = res;
        if (!res.profilePic) {
          $scope.userInformation.profilePic = "../../assets/img/icons/default-avatar.png";
        }
        $scope.syncGenderDateDet();
      }).error(function(err) {
        //checks error
      });

      EventService.getMyPublishedEvents().success(function(res) {
        $scope.publishedEvents = res;

      }).error(function(err) {
        //checks error
      });

      EventService.getMyEventDrafts().success(function(res) {
        $scope.eventDrafts = res;

      }).error(function(err) {
        //checks error
      });

    }

    $scope.organizerButtnSave = function(organizer) {

      if(!organizer.name){
        $window.alert("Name field is mandatory!");
        return;
      }

      if ($scope.orgProfileExists) {
        $scope.editOrganizer(organizer);
      } else {
        $scope.registerOrganizer(organizer);
      }
    }

    $scope.registerOrganizer = function(organizer) {

      OrganizerService.createProfile(organizer)
        .success(function(res) {
          
          $scope.userInformation.organizer_ref = res._id;
          $scope.organizer = res;
          $scope.organizerEditMode = false;
          $scope.orgProfileExists = true;

        }).error(function(err) {
          //checks error
        });
    };

    $scope.editOrganizer = function(organizer) {

      OrganizerService.editProfile(organizer)
        .success(function(res) {
          
          $scope.organizer = res;
          $scope.organizerEditMode = false;
        }).error(function(err) {
          //checks error
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

        }).error(function(err) {
          //checks error
        });
    };

    $scope.updateUser = function() {

      if(!$scope.userInformation.firstname || !$scope.userInformation.lastname ||!$scope.userInformation.email){
        $window.alert("Fill all mandatory!");
        return;
      }

      UserService.editProfile($scope.userInformation)
        .success(function(res) {
          
          $scope.userInformation = res;
          $scope.syncGenderDateDet();
          $scope.userEditMode = false;

        }).error(function(err) {
          //checks error
        });
    };

    $scope.uploadPicture = function() {

      if (!$scope.userInformation.newImage) {

        return;
      }

      UserService.uploadPicture({
          newImage: $scope.userInformation.newImage
        })
        .success(function(res) {

          if (res.imageUrl)
            $scope.userInformation.profilePic = res.imageUrl;
          $scope.userEditMode = false;

        }).error(function(err) {
          //checks error
        });
    };

    $scope.previewImg = function(inElement, prevElement) {
      $(inElement).on('change', function() {
        var preview = document.querySelector(prevElement);
        var file = document.querySelector(inElement).files[0];
        var reader = new FileReader();
        reader.onloadend = function() {
          preview.src = reader.result;
        }
        if (file) {
          reader.readAsDataURL(file);
        } else {
          preview.src = "";
        }
      })
    };

    $scope.switchUserEditMode = function(mode) {
      $scope.userEditMode = mode;

      $scope.userInformation.newImage = undefined;

      if (mode) {
        $scope.tempUserProfile = angular.copy($scope.userInformation);
      } else {
        $scope.userInformation = angular.copy($scope.tempUserProfile);
      }
    }

    $scope.switchOrganizerEditMode = function(mode) {
      $scope.organizerEditMode = mode;
      $scope.organizer.newImage = undefined;
      if (mode) {

        $scope.tempOrgProfile = angular.copy($scope.organizer);
      } else {
        $scope.organizer = angular.copy($scope.tempOrgProfile);

      }
    }

    $scope.syncGenderDateDet = function() {

      if (angular.lowercase($scope.userInformation.gender) === "m") {

        $scope.userInformation.genderDet = "Male";
      } else if (angular.lowercase($scope.userInformation.gender) === "f") {
        $scope.userInformation.genderDet = "Female";
      } else {
        $scope.userInformation.genderDet = $scope.userInformation.gender;
      }

      $scope.userInformation.dobDet = parseDate($scope.userInformation.dateOfBirth);
    }

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
          };
        });
    };


    function parseDate(date) {
      if (!date)
        return "";
      var dateObj = new Date(Date.parse(date));
      var dateString = (Number(dateObj.getMonth()) + 1) + "-" + dateObj.getDate() + "-" + dateObj.getFullYear();
      return dateString;
    }

  }]);
