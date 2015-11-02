"use strict";
angular.module('eventApp')
  .controller('resetPasswordCtrl', ['$scope', 'UserService', '$stateParams', '$location', '$timeout', function($scope, UserService, $stateParams, $location, $timeout) {

    $scope.token = $stateParams.token;
    $scope.savePassword = function(token, password) {
      if ($scope.password1 === $scope.password2) {
        UserService.resetPassword(token, {'password': password})
          .success(function(data) {
            $scope.successMessage = true;
            $scope.passwordMismatch = false;
            $scope.passReset = true;
            $timeout(function(){$location.url('/home');}, 3000);
          });
      } else if ($scope.password2 && $scope.password1) {
        $scope.passwordMismatch = true;
      }
    };
  }]);