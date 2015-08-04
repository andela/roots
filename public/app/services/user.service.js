angular.module('eventApp')
  .factory('UserService', ['$http', 'baseUrl', function ($http, baseUrl) {

    return {
      createUser: function(param) {
        return $http.post(baseUrl + "users", param);
      },
      authenticate: function(param) {
        return $http.post(baseUrl + "authenticate", param);
      },
      decodeUser: function() {
        var token = localStorage.getItem('userToken');
        return $http.get(baseUrl + "decode?token=" + token);
      },
      sendWelcomeMail: function(data) {
        return $http.post(baseUrl + "user/welcomeMail", data);
      }
    };

  }]);