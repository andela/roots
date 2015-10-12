angular.module('eventApp')
  .controller('eventViewCtrl', ['$scope', '$stateParams', '$location', 'EventService', 'OrganizerService', '$rootScope', '$state', '$sce', function($scope, $stateParams, $location, EventService, OrganizerService, $rootScope, $state, $sce) {

      $scope.services = function(){

        EventService.getEvent($stateParams.event_id)
          .success(function(event){
            $scope.event = event;

            $scope.event.description = $sce.trustAsHtml($scope.event.description);

            $('.md-warn').css('background-color', event.eventTheme.headerColor);
            $('.md-warn').css('color', event.eventTheme.fontColor);
            $('.values').css('border-color', event.eventTheme.borderColor);
            $('.values').css('background-color', event.eventTheme.contentColor);
            $('.values').css('color', event.eventTheme.fontColor);

            $scope.canPublish = $rootScope.loggedIn && $rootScope.userId === $scope.event.user_ref._id && !$scope.event.online;

            $scope.canEdit = $rootScope.loggedIn && $rootScope.userId === $scope.event.user_ref._id;
            
            if (event.user_ref.organizer_ref) {

              OrganizerService.getOrganizer(event.user_ref.organizer_ref)
                .success(function(organizer) {                
                  $scope.organizer = organizer;
                  $scope.organizer.phoneNumber1 = event.user_ref.phoneNumber1;
                });
            }
          });
      };

      $rootScope.hideBtn = false;

      $scope.editEvent = function() {
        $state.go('user.editEvent', {
          event_id: $stateParams.event_id
        });
        document.body.scrollTop = document.documentElement.scrollTop = 0;
      }

      $scope.deleteEvent = function(){
        EventService.deleteEvent($stateParams.event_id);
        $location.url('/home');
      };

      $scope.publishEvent = function() {
        EventService.publishEvent($stateParams.event_id)
          .success(function(data) {
            $scope.canPublish = false;          
          });
      }
  }]);
