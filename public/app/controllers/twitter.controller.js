'use strict';
angular.module('eventApp')
  .controller('twitterCtrl', ['$scope', 'UserService', '$stateParams', '$location', '$timeout', function($scope, UserService, $stateParams, $location, $timeout) {

    $scope.sendWelcomeMail = function(recipient) {
      var data = ({
        mail: recipient.email,
        name: ''
      });
      UserService.sendWelcomeMail(data).success(function(data, status, headers, config) {

      });
    };

    var userToken = $location.search().twitToken;
    $location.search('twitToken', null);
    if (userToken) {
      localStorage.setItem('twitToken', userToken);
    }

    $scope.completeUserCheck = function() {
      if(localStorage.getItem('twitToken')) {
        UserService.decodeTwitUser().then(function(res) {
          $scope.userId = res.data._id;
        });
      }
    };

    $scope.changeMail = function(userInfo) {
      if(localStorage.getItem('twitToken')) {
        UserService.editTwitUser($scope.userId, userInfo).then(function(res){
          if(res.data.code){
            $scope.emailTaken = true;
          }
          else {
            $scope.sendWelcomeMail({
                email: userInfo.email
              });
            localStorage.removeItem('twitToken');
            $location.url('/home?token=' + res.data.token);
          }
        });
      }
    };

  }]);