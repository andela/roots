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
      processFacebookToken: function() {

        if (!localStorage.getItem('userName')) {
          
          if ($stateParams.token) {

            var token = $stateParams.token;
            $location.search('token', null);

            var user = {};
            if (typeof token !== 'undefined') {
              var encoded = token.split('.')[1];
              user = JSON.parse(urlBase64Decode(encoded));
              localStorage.setItem('userName', user.firstname);
            }

          }
        }

      }
    };

  }]);
