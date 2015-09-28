'use strict';

angular.module('eventApp')
  .controller('profileCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {

    $rootScope.hideBtn = false;

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