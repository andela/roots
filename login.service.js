angular.module('eventApp')
  .factory('LoginService', ['$http', 'baseUrl', function ($http, baseUrl) {

    return {
      createUser: function(param) {//shouldn't be createUser
        return $http.post(baseUrl + "login", param);
      }
    };

  }]);