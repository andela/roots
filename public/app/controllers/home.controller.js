App.controller('homeCtrl',['$scope', function($scope) {

   $("a[href='#downpage']").click(function() {
      $("html, body").animate({ scrollTop: $('#event_list').height() }, "slow");
      return false;
    });

    $(document).scroll(function() {
      $('#site_logo').toggle($(this).scrollTop() > 150);
    });

    $(window).scroll(function() {
      if ($(this).scrollTop() > 150) { //use `this`, not `document`
        $('#heading_logo').fadeOut('60000');
      }
      if ($(this).scrollTop() < 150) { //use `this`, not `document`
        $('#heading_logo').css({'display': 'block'});
      }
    });

   $(window).scroll(function() {
    if ($(this).scrollTop() > 220) { //use `this`, not `document`
        $('#typing_logo').fadeOut('60000');
    }
    if ($(this).scrollTop() < 220) { //use `this`, not `document`
        $('#typing_logo').css({'display': 'block'});
    }
  });

   $(window).scroll(function() {
    if ($(this).scrollTop() > 290) { //use `this`, not `document`
        $('#btn_div').fadeOut('60000');
    }
    if ($(this).scrollTop() < 290) { //use `this`, not `document`
        $('#btn_div').css({'display': 'block'});
    }
  });

  $scope.orightml = '';
  $scope.htmlcontent = $scope.orightml;
  $scope.disabled = false;
  
}]);

