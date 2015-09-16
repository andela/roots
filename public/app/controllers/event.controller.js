angular.module('eventApp')
  .controller('eventCtrl', ['$scope', '$mdDialog', '$mdToast', '$location', 'UserService', function ($scope, $mdDialog, $mdToast, $location, UserService) {

    $scope.signupCheck = function() {
      if(localStorage.getItem('userToken')) {
        UserService.decodeUser().then(function(res) {
          $scope.userName = res.data.firstname;
          $scope.profilePic = res.data.profilePic || "../../assets/img/icons/default-avatar.png";
          $scope.loggedIn = true;
        });
      }
      else {
        $location.url('/home');
      }
    };

}]);