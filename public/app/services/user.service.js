angular.module('eventApp')
  .factory('UserService', ['$http', 'baseUrl', function ($http, baseUrl) {

    return {
      createUser: function(param) {
        return $http.post(baseUrl + "users", param);
      },
      authenticate: function(param) {
        return $http.post(baseUrl + "authenticate", param);
      }
    };

  }]);