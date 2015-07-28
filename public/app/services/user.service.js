angular.module('eventApp')
  .factory('UserService', ['$http', function ($http) {

    var baseUrl = 'http://localhost:3030/api/';
    // var baseUrl = 'https://roots-event-manager.herokuapp.com/api/';

    return {
      createUser: function(param) {
        return $http.post(baseUrl + "users", param);
      }
    };

  }]);