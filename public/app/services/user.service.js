angular.module('eventApp')
  .factory('UserService', ['$http', '$stateParams', '$location', 'baseUrl', function($http, $stateParams, $location, baseUrl) {

    function urlBase64Decode(str) {
      var output = str.replace('-', '+').replace('_', '/');
      switch (output.length % 4) {
        case 0:
          break;
        case 2:
          output += '==';
          break;
        case 3:
          output += '=';
          break;
        default:
          throw 'Illegal base64url string!';
      }
      return window.atob(output);
    }


    return {
      createUser: function(param) {
        return $http.post(baseUrl + "users", param);
      },
      authenticate: function(param) {
        return $http.post(baseUrl + "authenticate", param);
      },
      decodeUser: function(scope) {

        if (localStorage.getItem('userToken')) {
          var token = localStorage.getItem('userToken');

          var user = {};
          if (typeof token !== 'undefined') {
            var encoded = token.split('.')[1];
            user = JSON.parse(urlBase64Decode(encoded));
            scope.userName = user.firstname;
            scope.profilePic = user.profilePic || "../../assets/img/icons/default-avatar.png";
            scope.loggedIn = true;
          }

        }

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
