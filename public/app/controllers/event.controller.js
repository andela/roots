angular.module('eventApp')

  .controller('eventCtrl', ['$scope', '$stateParams', 'UserService', '$location', 'EventService', 'Upload', '$rootScope', '$state', '$window', '$sce', function($scope, $stateParams, UserService, $location, EventService, Upload, $rootScope, $state, $window, $sce) {

    if (!localStorage.getItem('userToken')) {
      $location.url('/home');
    }else{
      $rootScope.hideBtn = true;


      UserService.getCurrentUser().success(function(res) {
        
        if(res.organizer_ref){

          $scope.organizer = res.organizer_ref;
          $scope.organizer.phoneNumber1 = res.phoneNumber1;
          $scope.organizer.phoneNumber2 = res.phoneNumber2;          
        }        
       
      }).error(function(err){
        //checks error
      });
    }

  $rootScope.hideBtn = true;
 
    $scope.submitEventDetails = function(eventDetails, organizer) {

      if(eventDetails.startDate > eventDetails.endDate){
          $window.alert('invalid date range');
          return;
      }else{
        eventDetails.venue.country = $scope.getCountryCode().text;
        $scope.isLoading = true;
        EventService.createEvent(eventDetails)
          .success(function(data) {
            $state.go('user.eventDetails', {event_id: data._id});
            document.body.scrollTop = document.documentElement.scrollTop = 0;
          });
      }
    };

    $scope.view = 'create';

    $scope.currDisplay = function(view) {
      $scope.view = view;
    };

    $scope.switchView = function() {
      $scope.prev = !$scope.prev;
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    }; 

  $scope.categories = ('Technology,Sport,Health,Music,Art,Science,Spirituality,Media,Family,Education,Party').split(',').map(function(category){
    return {
      name: category
    };
  });

  $scope.getCountryCode = function() {
    var e = document.getElementById("ddlViewBy");
    var ctCode = e.options[e.selectedIndex].value;
    var ctName = e.options[e.selectedIndex].text;
    return {
     code: ctCode,
     text: ctName
    };
  };

  $scope.getCountry = function() {
    //$scope.result = '';
    if(!$scope.venue){
      $scope.venue = {};
    }  
    $scope.venue.address = '';
    $scope.options1 = {
      country: $scope.getCountryCode().code
    };
    $scope.details = '';
  };
   $scope.publishEvent = function(publish){
    $scope.event.online = publish;      
  }

  $scope.previewImg = function (inElement,prevElement,imageElement){
    $(inElement).on('change', function () {
      var preview = document.querySelector(prevElement);
      var file    = document.querySelector(inElement).files[0];
      var prevImage = document.querySelector(imageElement);
      var reader  = new FileReader();
      reader.onloadend = function () {
        preview.src = reader.result;

        if(prevImage)
          prevImage.src = reader.result;
      }
        if ((file && prevImage) || file) {
          reader.readAsDataURL(file);
        } else {
          preview.src = "";
          prevImage.src = "";
        }
    })
  };
  
  $scope.changeColor = function(elem) {
      $('md-toolbar.md-warn').css("background-color", elem);
  };

  $scope.$watch("organizer.about",
    function(oldVal, newVal){
      if(oldVal !== newVal){
        $scope.orgInfo = $sce.trustAsHtml($scope.organizer.about)
    }
  });

  $scope.$watch("event.description",
    function(oldVal, newVal){
      if(oldVal !== newVal){
        $scope.eventInfo = $sce.trustAsHtml($scope.event.description)
    }
  });

  $scope.event = {
    eventTheme:{
      headerColor:'rgb(30, 25, 84)',
      borderColor:'',
      fontColor:'rgb(155, 86, 86)',
      contentColor:''
    },
    venue: {}
  };

  $scope.fetchEvents = function() {

    EventService.getAllEvents().then(function(data) {
      $scope.eventList = data.data;
    });
  };

  $scope.prev = false;
  $scope.organizer = {
    about: '',
    phoneNumber1: ''
  };

  $scope.find = {
      name:'',
    category:'',
    venue:{
      country:''
    }
  }
  $scope.countryCode = "";
    
  $scope.$watch("countryCode", function(){    
    if(!$scope.countryCode){
      $scope.find.venue.country = "";
      return;
    }
    $scope.find.venue.country = $scope.getCountryCode().text;    
  });

}]);
