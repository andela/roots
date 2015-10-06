angular.module('eventApp')
  .controller('eventCtrl',['$scope','$stateParams','UserService','$location', 'EventService','Upload','$rootScope','$sce','$window', function ($scope, $stateParams, UserService, $location, EventService, Upload, $rootScope, $sce, $window) {
   if (!localStorage.getItem('userToken')) {
    $location.url('/user/home');
  }
  $rootScope.hideBtn = true;
  $scope.services = function(){
    EventService.getEvent($stateParams.event_id)
      .success(function(event){
        $scope.event = event;
        $('.md-warn').css('border-color', event.borderColor);
        $('.md-warn').css('background-color', event.headerColor);
        $('.md-warn').css('color', event.fontColor);
        $('.values').css('border-color', event.borderColor);
        $('.values').css('background-color', event.contentColor);
        $('.values').css('color', event.fontColor);
        $scope.Address = event.venue;
        EventService.getOrganizer(event.org_name)
      .success(function(organizer){
        $scope.organizer = organizer[0];
      });
    });
  };
  
  $scope.submitEventDetails = function (eventDetails, organizer){
    
    if(eventDetails.startDate > eventDetails.endDate){
      $window.alert('invalid date range');
    }
    else {
    eventDetails.country = $scope.getCountryCode().text;
    $scope.isLoading = true;
    var token = localStorage.getItem('userToken');
    eventDetails.user_ref = $rootScope.userId;
    organizer.user_ref = $rootScope.userId;
    eventDetails.org_name = organizer.name;
    Upload.upload({
      method: "POST",
      url: '/api/event?token='+ token,
      file: eventDetails.imageUrl,
      fields: eventDetails
    })
    .success(function(data) {
      $scope.submitOrgProfile(organizer,token);
    })
    }
  };

  $scope.submitOrgProfile = function(organizer,token){
   Upload.upload({
     method: "POST",
     url: '/api/organizer?token='+ token,
     file: organizer.imageUrl,
     fields: organizer
   }).success(function(data){
     $scope.isLoading = false;
       $location.url('/home');
     });
  };

  $scope.view = 'create';

  $scope.currDisplay = function(view){
    $scope.view = view;
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
    $scope.result = '';
    $scope.options1 = {
      country: $scope.getCountryCode().code
    };
    $scope.details = '';
  };

  $scope.previewImg = function (inElement,prevElement,imageElement){
    $(inElement).on('change', function () {
      var preview = document.querySelector(prevElement);
      var file    = document.querySelector(inElement).files[0];
      var prevImage = document.querySelector(imageElement);
      var reader  = new FileReader();
      reader.onloadend = function () {
        preview.src = reader.result;
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
      headerColor:'',
      borderColor:'',
      fontColor:'',
      contentColor:''
  };

  $scope.organizer = {
    about: '',
    phoneNumber1: ''
  };

}]);
