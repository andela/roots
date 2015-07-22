'use strict';

angular.module('eventApp')
  .controller('homeCtrl',['$scope', '$mdDialog', '$mdToast', function($scope, $mdDialog, $mdToast) {

    $("a[href='#downpage']").click(function() {
      $("html, body").animate({ scrollTop: $('#event_list').height() }, "slow");
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

    }
}]);

