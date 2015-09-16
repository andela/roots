
angular.module('eventApp')
  .controller('createeventCtrl', function($scope, $rootScope, UserService, $location, $sce) {

    $scope.createEventPage = function (){
      $location.url('/createevent');
    };

    $rootScope.signupCheck = function() {
      if (localStorage.getItem('userToken')) {
        UserService.decodeUser($scope);
      }
    };

    $scope.previewFile = function(input, img) {
      $(input).on('change', function(){
		var preview = document.querySelector(img);
		var file    = document.querySelector(input).files[0];
		var reader  = new FileReader();

// angular.module('eventApp')
//   .controller('createeventCtrl', function($scope, $rootScope, UserService, $location, $sce) {
//     $scope.createEventPage = function (){
//       $location.url('/createevent');
//     };

//     $rootScope.signupCheck = function() {
//       if (localStorage.getItem('userToken')) {
//         UserService.decodeUser($scope);
//       }
//     };

//     $scope.previewFile = function(input, img) {
//       $(input).on('change', function(){
// 		var preview = document.querySelector(img);
// 		var file    = document.querySelector(input).files[0];
// 		var reader  = new FileReader();


// 		reader.onloadend = function () {
// 		  preview.src = reader.result;
// 		}


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


    $scope.changeColor = function(elem) {
      $('md-toolbar.md-warn').css("background-color", elem);

	};


    $("#fileUpload").on('change', function () {

        if (typeof (FileReader) != "undefined") {

            var image_holder = $("#image-holder");
            image_holder.empty();

            var reader = new FileReader();
            reader.onload = function (e) {
                $("<img />", {
                    "src": e.target.result,
                    "class": "thumb-image"
                }).appendTo(image_holder);

            }
            image_holder.show();
            reader.readAsDataURL($(this)[0].files[0]);
        } else {
            alert("This browser does not support FileReader.");
        }
    });

  	$rootScope.signupCheck = function() {
      if(localStorage.getItem('userToken')) {
        UserService.decodeUser().then(function(res) {
          $scope.userName = res.data.firstname;
          $scope.profilePic = res.data.profilePic || "../../assets/img/icons/default-avatar.png";
          $scope.loggedIn = true;
        });
      }
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

      country: '',
      category:'',
      organizerName : '',
      organizerInfo : '',
      organizerPhonenumber1 : '',
      organizerPhonenumber2 : '',
      logoImg:'',
      headerColor:'',
      borderColor: '',
      fontColor:'',
      contentColor:'',
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
    };

   //  $scope.editor = function() {
   //    var $editor = $("#editor"),
   //    str = $scope.event.organizerInfo,
	  // html = $.parseHTML(str);
	  // $editor.html(html);
	  // console.log(html);

   //  };

    $scope.$watch("event.organizerInfo",
      function(oldVal, newVal){
        if(oldVal !== newVal){
          $scope.orgInfo = $sce.trustAsHtml($scope.event.organizerInfo)
        }
      });


// 		if (file) {
// 		  reader.readAsDataURL(file);
// 		} else {
// 		  preview.src = "";
// 		}
// 	  });
// 	};

//     $scope.changeColor = function(elem) {
//       $('md-toolbar.md-warn').css("background-color", elem);
// 	};

// 	$scope.event = {
//       title: '',
//       description: '',
//       venueName: '',
//       address1: '',
//       address2: '',
//       startDate: '',
//       endDate: '',
//       startTime: '',
//       endTime: '',
//       bannerImg: '',
//       country: '',
//       category:'',
//       organizerName : '',
//       organizerInfo : '',
//       organizerPhonenumber1 : '',
//       organizerPhonenumber2 : '',
//       logoImg:'',
//       headerColor:'',
//       borderColor: '',
//       fontColor:'',
//       contentColor:'',
//       organizerTeamMembers : {
//         one : {
//     	  name : '',
//     	  email : '',
//     	  role : ''
//     	},
//     	two : {
// 		  name : '',
// 		  email : '',
// 		  role : ''
// 	    },
// 	    three : {
// 		  name : '',
// 		  email : '',
// 		  role : ''
// 	    }
//       },
//     };

//    //  $scope.editor = function() {
//    //    var $editor = $("#editor"),
//    //    str = $scope.event.organizerInfo,
// 	  // html = $.parseHTML(str);
// 	  // $editor.html(html);
// 	  // console.log(html);

//    //  };

//     $scope.$watch("event.organizerInfo",
//       function(oldVal, newVal){
//         if(oldVal !== newVal){
//           $scope.orgInfo = $sce.trustAsHtml($scope.event.organizerInfo)
//         }
//       });

//     $scope.category = {
//       categories : [
//         "Business",
//         "Entertainment",
//         "Art",
//         "Social",
//         "Technology"
//       ]
//     }

    $scope.country = {
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
    }

//     $scope.country = {
//       countries : [
//         "Albania",
// 	    "Andorra",
// 	    "Armenia",
// 	    "Austria",
// 	    "Azerbaijan",
// 	    "Belarus",
// 	    "Belgium",
// 	    "Bosnia & Herzegovina",
// 	    "Bulgaria",
// 	    "Croatia",
// 	    "Cyprus",
// 	    "Czech Republic",
// 	    "Denmark",
// 	    "Estonia",
// 	    "Finland",
// 	    "France",
// 	    "Georgia",
// 	    "Germany",
// 	    "Greece",
// 	    "Hungary",
// 	    "Iceland",
// 	    "Ireland",
// 	    "Italy",
// 	    "Kosovo",
// 	    "Latvia",
// 	    "Liechtenstein",
// 	    "Lithuania",
// 	    "Luxembourg",
// 	    "Macedonia",
// 	    "Malta",
// 	    "Moldova",
// 	    "Monaco",
// 	    "Montenegro",
// 	    "Netherlands",
// 	    "Nigeria",
// 	    "Norway",
// 	    "Poland",
// 	    "Portugal",
// 	    "Romania",
// 	    "Russia",
// 	    "San Marino",
// 	    "Serbia",
// 	    "Slovakia",
//         "Slovenia",
// 	    "Spain",
// 	    "Sweden",
// 	    "Switzerland",
//         "Turkey",
// 	    "Ukraine",
// 	    "United Kingdom",
// 	    "Vatican City"
//       ],
//     }
// })
