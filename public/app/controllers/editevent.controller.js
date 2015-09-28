angular.module('eventApp')
  .controller('editeventCtrl',['$scope','$stateParams','UserService','$location', 'EventService','Upload','$rootScope','$sce', function ($scope, $stateParams, UserService, $location, EventService, Upload, $rootScope, $sce) {
    
    if (!localStorage.getItem('userToken')) {
      $location.url('/user/home');
    }

    EventService.getEvent($stateParams.event_id)
      .success(function(event){
        $scope.event = event;
      });

    $scope.categories = ('Technology,Sport,Health & Fitness,Music,Food & Drink,Arts,Parties,Business').split(',').map(function(category){
      return {
        name: category
      };
    });

    $scope.previewImg = function (inElement,prevElement){
      $(inElement).on('change', function () {
        var preview = document.querySelector(prevElement);
        var file    = document.querySelector(inElement).files[0];
        var reader  = new FileReader();
        reader.onloadend = function () {
          preview.src = reader.result;
        }

        if (file) {
          reader.readAsDataURL(file);
        } else {
          preview.src = "";
        }
      })
    };
    $scope.delete = function(){
      EventService.deleteEvent($stateParams.event_id);
      $location.url('/home');
    };

    $scope.submitEventDetails = function (eventDetails){
      var token = localStorage.getItem('userToken');
      eventDetails.user_ref = $rootScope.userId;
      Upload.upload({
        method: "PUT",
        url: '/api/event/' + $stateParams.event_id + '?token='+ token,
        file: eventDetails.imageUrl,
        fields: eventDetails
      })
      .success(function(data) {
          $location.url('/home');
      })
    };

}]);
