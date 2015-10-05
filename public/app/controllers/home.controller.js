'use strict';

angular.module('eventApp')
  .controller('homeCtrl', ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'UserService', '$location', 'EventService', function($scope, $rootScope, $mdDialog, $mdToast, UserService, $location, EventService) {
    $("a[href='#downpage']").click(function() {
      $("html, body").animate({
        scrollTop: $('#event-list').offset().top
      }, "slow");
      return false;
    });
    $rootScope.hideBtn = false;
    var userToken = $location.search().token;
    $location.search('token', null);
    if (userToken) {
      localStorage.setItem('userToken', userToken);
    }

    $rootScope.signupCheck = function() {      
      if (localStorage.getItem('userToken')) {
        UserService.decodeUser();
      }
    }    

    $scope.getOrganizers = function() {
      EventService.getAllProfiles().then(function(data) {
        $scope.organizers = data.data;
      })
    };

    $scope.logout = function() {
      localStorage.removeItem('userToken');
      $rootScope.loggedIn = false;
      $location.url('/home');
    };

    $scope.login = function(view) {
      $mdDialog.show({
        clickOutsideToClose: true,
        controller: UserLogin,
        locals: {
          view: view
        },
        templateUrl: "app/views/login.view.html"
      });
    };

    $scope.toEvent = function() {
      if ($scope.loggedIn = true)
        $location.path("/cevent");
    };

    $scope.fetchEvents = function() {

      EventService.getAllEvents().then(function(data) {
        $scope.eventList = data.data;
      });
    };

    function UserLogin($scope, $rootScope, $mdDialog, view) {
      if (view === 'signup') {
        $scope.signupDialog = true;
      } else {
        $scope.loginDialog = true;
      }

      $scope.closeDialog = function() {
        $mdDialog.hide();
      };

      $scope.toggleDialog = function() {
        $scope.signupDialog = !$scope.signupDialog;
        $scope.loginDialog = !$scope.loginDialog;
      };

      $scope.toggleView = function() {
        $scope.loginDialog = !$scope.loginDialog;
        $scope.resetDialog = !$scope.resetDialog;
      };

      function validateEmail(email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
      }

      $scope.loginUser = function(userData) {
        $scope.wrongEmail = false;
        $scope.wrongPassword = false;
        UserService.authenticate(userData).then(function(res) {
          $scope.progressLoad = true;
          if (res.data.message === 'Authentication failed. User not found.') {
            $scope.wrongEmail = true;
            $scope.wrongPassword = false;
            $scope.progressLoad = false;
          } else if (res.data.message === 'Authentication failed. Wrong password.') {
            $scope.wrongEmail = false;
            $scope.wrongPassword = true;
            $scope.progressLoad = false;
          } else {
            localStorage.setItem('userToken', res.data.token);
            $rootScope.signupCheck();
            $mdDialog.hide();
          }
        });
      };

      $scope.signupUser = function(newUser) {

        if (validateEmail(newUser.email)) {
          $scope.progressLoad = true;
          UserService.createUser(newUser).then(function(res) {
            if (res.data.message) {
              $scope.emailTaken = true;
              $scope.progressLoad = false;
              $scope.validEmail = false;
            } else {
              $scope.loginUser({
                email: newUser.email,
                password: newUser.password
              });
            }
          });
        } else {
          $scope.emailTaken = false;
          $scope.validEmail = true;
        }
      };

      $scope.resetLink = function(userEmail) {
        UserService.sendLink(userEmail).then(function(res) {
          $scope.errorEmail = false;
          $scope.progressBar = true;
          if ((res.data.message === 'No user found') && userEmail) {
            $scope.errorEmail = true;
            $scope.progressBar = false;
          } else if (res.data.message === 'Message Sent!') {
            $scope.emailSent = true;
          }
         
          $scope.progressBar = false;
        });
      };
    }

    $rootScope.sendWelcomeMail = function(recipient) {
      var data = ({
        mail: recipient.email,
        name: recipient.firstname
      });
      UserService.sendWelcomeMail(data).success(function(data, status, headers, config) {

      });
    };
  }]);
