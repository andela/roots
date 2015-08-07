describe('User Authentication Test', function() {
  var signupLink = element(by.id('signupLink'));
  var loginLink = element(by.id('loginLink'));
  var showSignupLink = element(by.id('showSignupLink'));
  var showLoginLink = element(by.id('showLoginLink'));
  var signupButtn = element(by.id('signupButtn'));
  var loginButtn = element(by.id('loginButtn'));
  var emailFld = element(by.model('newUser.email'));
  var firstnameFld = element(by.model('newUser.firstname'));
  var lastnameFld = element(by.model('newUser.lastname'));
  var passwordFld = element(by.model('newUser.password'));

  var messageFlds = element.all(by.css('.password_message'));


  describe('Sign up Test', function() {

    beforeEach(function() {
      browser.get('/');
      browser.driver.manage().window().maximize();﻿
    });

    it('expects Sign up link to be present and as link', function() {      
      fieldDisplayTest(signupLink, 'a');
      fieldTextTest(signupLink, 'Sign up');
    });

    it('expects input fields to be present', function() {

      signupLink.click();

      fieldDisplayTest(emailFld, 'input');
      fieldDisplayTest(firstnameFld, 'input');
      fieldDisplayTest(lastnameFld, 'input');
      fieldDisplayTest(passwordFld, 'input');
      fieldDisplayTest(signupButtn, 'button');

      fieldAttribTest(emailFld, 'type', 'email');
      fieldAttribTest(firstnameFld, 'type', 'text');
      fieldAttribTest(lastnameFld, 'type', 'text');
      fieldAttribTest(passwordFld, 'type', 'password');

      expect(signupButtn.isEnabled()).toBe(false);

    });

    it('expects login dialog to be displayed', function() {

      signupLink.click();
      showLoginLink.click();
      expect(loginButtn.isDisplayed()).toBe(true);      
    });


    it('expects correct validation messages to displayed', function() {

      signupLink.click();

      emailFld.sendKeys('hfjshfj@mail');
      firstnameFld.sendKeys('hfjshfj');
      lastnameFld.sendKeys('hfjshfj');
      passwordFld.sendKeys('hfjshfj');

      signupButtn.click();
      
      fieldTextTest(messageFlds.get(2), 'Enter Valid Email')


    });
  });

  function fieldDisplayTest(field, expectedTagName) {

    expect(field.isDisplayed()).toBe(true);
    field.getTagName().then(function(value) {
      expect(value).toBe(expectedTagName);
    });

  }

  function fieldAttribTest(field, attrib, expectedAtrribValue){

    field.getAttribute(attrib).then(function(value) {
      expect(value).toBe(expectedAtrribValue);
    });

  }

  function fieldTextTest(field, expectedText) {

    field.getText().then(function(value) {
      expect(value).toBe(expectedText);
    });
  }

});
