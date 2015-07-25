'use strict';

angular.module('eventApp')
  .controller('homeCtrl',['$scope', '$mdDialog', '$mdToast', function($scope, $mdDialog, $mdToast) {

    $("a[href='#downpage']").click(function() {
      $("html, body").animate({ scrollTop: $('#event_list').offset().top}, "slow");
      return false;
    });

    $scope.login = function(view) {
      $mdDialog.show({
        clickOutsideToClose : true,
        controller : UserLogin,
        locals: {view: view},
        templateUrl: "app/views/login.view.html"
      });
    };

    function UserLogin($scope, $mdDialog, view) {
      if(view=='signup') {
        $scope.signup_dialog = true;
      }

      $scope.closeDialog = function() {
        $mdDialog.hide();
      };

      $scope.login = function() {
        console.log(view);
      };
    }
}]);

