angular.module('eventApp')
  .controller('createeventCtrl', function($scope, $rootScope, UserService, $location) {
    $scope.createEventPage = function (){
      $location.url('/createevent');
    };

    $rootScope.signupCheck = function() {
      if (localStorage.getItem('userToken')) {
        UserService.decodeUser($scope);
      }
    }

    $scope.previewFile = function(input, img) {
      $(input).on('change', function(){
		var preview = document.querySelector(img);
		var file    = document.querySelector(input).files[0];
		var reader  = new FileReader();

		reader.onloadend = function () {
		  preview.src = reader.result;
		}

		if (file) {
		  reader.readAsDataURL(file);
		} else {
		  preview.src = "";
		}
	  });
	};
 
    $scope.changeColor = function(elem,elem2) {
      $('md-toolbar.bars').css("background-color", elem);
      $('md-toolbar.bars1').css("background-color", elem2);
	};
    
	$scope.event = {
      title: '',
      description: '',
      venueName: '',
      address1: '',
      address2: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      bannerImg: '',
      organizerName : '',
      organizerInfo : '',
      organizerPhonenumber1 : '',
      organizerPhonenumber2 : '',
      logoImg:'',
      organizerTeamMembers : {
        one : {
    	  name : '',
    	  email : '',
    	  role : ''
    	},
    	two : {
		  name : '',
		  email : '',
		  role : ''
	    },
	    three : {
		  name : '',
		  email : '',
		  role : ''
	    }
      },
      categories : [
        "Business",
        "Entertainment",
        "Art",
        "Social",
        "Technology"
      ],
      countries : [
        "Albania",
	      "Andorra",
	      "Armenia",
	      "Austria",
	      "Azerbaijan",
	      "Belarus",
	      "Belgium",
	      "Bosnia & Herzegovina",
	      "Bulgaria",
	      "Croatia",
	      "Cyprus",
	      "Czech Republic",
	      "Denmark",
	      "Estonia",
	      "Finland",
	      "France",
	      "Georgia",
	      "Germany",
	      "Greece",
	      "Hungary",
	      "Iceland",
	      "Ireland",
	      "Italy",
	      "Kosovo",
	      "Latvia",
	      "Liechtenstein",
	      "Lithuania",
	      "Luxembourg",
	      "Macedonia",
	      "Malta",
	      "Moldova",
	      "Monaco",
	      "Montenegro",
	      "Netherlands",
	      "Nigeria",
	      "Norway",
	      "Poland",
	      "Portugal",
	      "Romania",
	      "Russia",
	      "San Marino",
	      "Serbia",
	      "Slovakia",
	      "Slovenia",
	      "Spain",
	      "Sweden",
	      "Switzerland",
	      "Turkey",
	      "Ukraine",
	      "United Kingdom",
	      "Vatican City"
    ],
  };
})