angular.module('eventApp')
  .factory('UserService', ['$http', '$stateParams', '$location', '$rootScope', 'Upload', 'baseUrl', function($http, $stateParams, $location, $rootScope, Upload, baseUrl) {

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
      getCurrentUser: function() {
        var token = localStorage.getItem('userToken');
        return $http.get(baseUrl + "user?token=" + token);
      },
      editProfile: function(user) {
        var token = localStorage.getItem('userToken');
        return $http.put(baseUrl + "user?token=" + token, user);        
      },
      uploadPicture: function(imageObj) {
        var token = localStorage.getItem('userToken');
        
        return Upload.upload({
          method: "POST",
          url: '/api/user/uploadpic?token=' + token,
          file: imageObj.newImage,
          fields: imageObj
        });
      },
      authenticate: function(param) {
        return $http.post(baseUrl + "authenticate", param);
      },
      decodeUser: function() {

        if (localStorage.getItem('userToken')) {
          var token = localStorage.getItem('userToken');

          var user = {};
          if (token) {
            var encoded = token.split('.')[1];
            user = JSON.parse(urlBase64Decode(encoded));
            $rootScope.userName = user.firstname;
            $rootScope.profilePic = user.profilePic || "../../assets/img/icons/default-avatar.png";
            $rootScope.userId = user._id;
            $rootScope.loggedIn = true;
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
