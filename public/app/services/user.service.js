angular.module('eventApp')
  .factory('UserService', ['$http', 'baseUrl', function($http, baseUrl) {

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
            scope.loggedIn = true;            
          }

        }
      }
    };

  }]);
