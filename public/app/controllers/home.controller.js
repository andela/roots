'use strict';

angular.module('eventApp')
  .controller('homeCtrl',['$scope', '$mdDialog', '$mdToast', function($scope, $mdDialog, $mdToast) {

    $("a[href='#downpage']").click(function() {
      $("html, body").animate({ scrollTop: $('#event_list').offset().top}, "slow");
      return false;
    });

    $scope.login = function(str) {
      $mdDialog.show({
        clickOutsideToClose : true,
        controller : UserLogin,
        locals: {str: str},
        templateUrl: "app/views/login.view.html"
      });
    };

    function UserLogin($scope, $mdDialog, str) {
      if(str=='signup') {
        $scope.signup_dialog = true;
      }
      
      $scope.closeDialog = function() {
        $mdDialog.hide();
      };

      $scope.login = function() {
        console.log(str);
      };
    }
}]);

