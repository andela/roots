'use strict';

angular.module('eventApp')
  .controller('profileCtrl', ['$scope', '$rootScope', 'EventService', 'Upload', 'UserService', function($scope, $rootScope, EventService, Upload, UserService) {

    $rootScope.hideBtn = false;

    UserService.getCurrentUser().success(function(res) {
      $scope.organizer = res.organizer_ref;
      $scope.userInformation = res;
      if(!res.profilePic){
         $scope.userInformation.profilePic = "../../assets/img/icons/default-avatar.png";
      }
    }).error(function(err){
      //checks error
    });

    $scope.registerOrganizer = function(organizer) {
      var token = localStorage.getItem('userToken');
      Upload.upload({
        method: "POST",
        url: '/api/organizer?token='+ token,
        file: organizer.newImage,
        fields: organizer
      })
      .success(function(res) {
        //checks server response
      }).error(function(err){
        //checks error
      });
    };

    $scope.previewImg = function (inElement,prevElement){
    $(inElement).on('change', function () {
      var preview = document.querySelector(prevElement);
      var file    = document.querySelector(inElement).files[0];
      var reader  = new FileReader();
      reader.onloadend = function () {
        preview.src = reader.result;
      }
      if (file) {
        reader.readAsDataURL(file);
      } else {
        preview.src = "";
      }
    })
  };

    $scope.events = [
      {
        imageUrl: 'http://www.thci-inc.com/wp-content/uploads/2014/05/enent10.jpg',
        name: 'First Event'
      },
      {
        imageUrl: 'http://www.thci-inc.com/wp-content/uploads/2014/05/enent10.jpg',
        name: 'Second Event'
      },
      {
        imageUrl: 'http://www.thci-inc.com/wp-content/uploads/2014/05/enent10.jpg',
        name: 'Third Event'
      },
      {
        imageUrl: 'http://www.thci-inc.com/wp-content/uploads/2014/05/enent10.jpg',
        name: 'Fourth Event'
      }


    ];

    $scope.saved = [
      {
        name: 'first event'
      },
      {
        name: 'Second event'
      }
    ];
  }]);