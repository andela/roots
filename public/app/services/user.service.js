angular.module('eventApp')
  .factory('UserService', ['$http', 'baseUrl', function ($http, baseUrl) {

    return {
      createUser: function(param) {
        return $http.post(baseUrl + "users", param);
      },
      facebookLogin: function() {
        return $http.get(baseUrl + "/api/facebook-login");
      }
    };

  }]);