'use strict';

angular.module('eventApp')
  .controller('homeCtrl',['$scope', '$rootScope', '$mdDialog', '$mdToast', 'UserService',  function($scope, $rootScope,$mdDialog, $mdToast, UserService) {

    $("a[href='#downpage']").click(function() {
      $("html, body").animate({ scrollTop: $('#event_list').offset().top}, "slow");
      return false;
    });

    $rootScope.signupCheck = function() {
      if(localStorage.getItem('userName')) {
        $scope.userName = localStorage.getItem('userName');
        $scope.loggedIn = true;
      }
    };

    $scope.logout = function() {
      localStorage.removeItem('userName');
      $scope.loggedIn = false;
    };


    $scope.login = function(view) {
      $mdDialog.show({
        clickOutsideToClose : true,
        controller : UserLogin,
        locals: {view: view},
        templateUrl: "app/views/login.view.html"
      });
    };

    function UserLogin($scope, $rootScope, $mdDialog, view) {
      if(view === 'signup') {
        $scope.signup_dialog = true;
      }

      $scope.closeDialog = function() {
        $mdDialog.hide();
      };

      function validateEmail(email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
      }

      $scope.signupUser = function(newUser) {
        if(validateEmail(newUser.email)){
          UserService.createUser(newUser).then(function(res) {
            console.log(res);
            if(res.data.message){
              $scope.emailTaken = true;
            }
            else {
              $scope.userName = localStorage.setItem('userName', res.data.firstname);
              $rootScope.signupCheck();
              $mdDialog.hide();
            }
          });
        }
        else {
          $scope.validEmail =true;
        }
      };
    }
}]);

