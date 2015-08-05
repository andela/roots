describe('User Authentication Test', function() {
  var signupLink = element(by.id('signupLink'));
  var loginLink = element(by.id('loginLink'));
  var showSignupLink = element(by.id('showSignupLink'));
  var showLoginLink = element(by.id('showLoginLink'));
  var signupButtn = element(by.id('showSignupButtn'));
  var loginButtn = element(by.id('loginButtn'));


  describe('Sign up Test', function() {

    beforeEach(function() {
      browser.get('/');
      browser.driver.manage().window().maximize();﻿
    });

    it('expects Sign up link to be present and as link', function() {

      expect(signupLink.isDisplayed()).toBe(true);

      signupLink.getText().then(function(value) {        
        expect(value).toBe('Sign up');
      });

      signupLink.getTagName().then(function(value) {
        console.log(value);
        expect(value).toBe('a');
      });
      
    });

    it('expects blablabla', function() {

      signupLink.click();
      showLoginLink.click();
      loginButtn.click();

    });
  });

});
