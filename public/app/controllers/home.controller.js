'use strict';

angular.module('eventApp')
  .controller('homeCtrl',['$scope', '$mdDialog', '$mdToast', function($scope, $mdDialog, $mdToast) {

    $("a[href='#downpage']").click(function() {
      $("html, body").animate({ scrollTop: $('#event_list').offset().top}, "slow");
      return false;
    });

    $scope.signup = function(ev) {
      $mdDialog.show({
        clickOutsideToClose : true,
        controller : UserSignup,
        templateUrl: "app/views/signup.view.html",
        targetEvent: ev
      });
    };

    function UserSignup($scope, $mdDialog) {
      $scope.closeDialog = function() {
        $mdDialog.hide();
      };
    }

    $scope.login = function(ev) {
      $mdDialog.show({
        clickOutsideToClose : true,
        controller : UserLogin,
        templateUrl: "app/views/login.view.html",
        targetEvent: ev
      });
    };

    function UserLogin($scope, $mdDialog) {
      $scope.closeDialog = function() {
        $mdDialog.hide();
      };
    }

    $scope.loginToCreate = function(ev) {
      $mdDialog.show({
        clickOutsideToClose : true,
        controller : ToCreate,
        templateUrl: "app/views/toCreate.view.html",
        targetEvent: ev
      });
    };

    function ToCreate($scope, $mdDialog) {
      $scope.closeDialog = function() {
        $mdDialog.hide();
      };
    }
}]);

