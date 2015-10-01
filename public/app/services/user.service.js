angular.module('eventApp')
  .factory('UserService', ['$http', '$stateParams', '$location', 'baseUrl', function($http, $stateParams, $location, baseUrl) {

    return {
      createUser: function(param) {
        return $http.post(baseUrl + "users", param);
      },
      getCurrentUser: function() {
        var token = localStorage.getItem('userToken');
        return $http.get(baseUrl + "user?token=" + token);
      },
      authenticate: function(param) {
        return $http.post(baseUrl + "authenticate", param);
      },
      decodeUser: function() {
        var token = localStorage.getItem('userToken');
        return $http.get(baseUrl + "decode?token=" + token);
      },
      decodeTwitUser: function() {
        var token = localStorage.getItem('twitToken');
        return $http.get(baseUrl + "decode?token=" + token);
      },
      editTwitUser: function(userId, param) {
        return $http.put(baseUrl + "twitterUser/" + userId, param);
      },
      sendWelcomeMail: function(data) {
        return $http.post(baseUrl + "user/welcomeMail", data);
      },
      sendLink: function(data) {
        return $http.post(baseUrl + "forgotPass", data);
      },
      resetPassword: function(token, data) {
        return $http.post(baseUrl + "reset/" + token, data);
      }
    };

  }]);
