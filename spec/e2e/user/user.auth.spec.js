describe('User Authentication Test', function() {
  var User = require('../../../app/models/user.model');
  var config = require('../../../config/config');
  var mongoose = require('mongoose');

  var signupLink = element(by.id('signupLink'));
  var loginLink = element(by.id('loginLink'));
  var logoutLink = element(by.id('logoutLink'));
  var showSignupLink = element(by.id('showSignupLink'));
  var showLoginLink = element(by.id('showLoginLink'));
  var signupButtn = element(by.id('signupButtn'));
  var loginButtn = element(by.id('loginButtn'));
  var newEmailFld = element(by.model('newUser.email'));
  var newFirstnameFld = element(by.model('newUser.firstname'));
  var newLastnameFld = element(by.model('newUser.lastname'));
  var newPasswordFld = element(by.model('newUser.password'));
  var emailFld = element(by.model('userInfo.email'));
  var passwordFld = element(by.model('userInfo.password'));

  var messageFlds = element.all(by.css('.password_message'));
  var welcomeLink = element(by.id('welcome'));

  describe('Sign up Test', function() {

    beforeEach(function() {
      browser.get('/');
      browser.driver.manage().window().maximize();﻿
    });

    describe('Sign up page and signup validation Test', function() {

      it('expects Sign up link to be present and as link', function() {
        fieldRenderTest(signupLink, 'a');
        fieldTextTest(signupLink, 'Sign up');
      });

      it('expects input fields to be present', function() {

        signupLink.click();

        fieldRenderTest(newEmailFld, 'input');
        fieldRenderTest(newFirstnameFld, 'input');
        fieldRenderTest(newLastnameFld, 'input');
        fieldRenderTest(newPasswordFld, 'input');
        fieldRenderTest(signupButtn, 'button');

        fieldAttribTest(newEmailFld, 'type', 'email');
        fieldAttribTest(newFirstnameFld, 'type', 'text');
        fieldAttribTest(newLastnameFld, 'type', 'text');
        fieldAttribTest(newPasswordFld, 'type', 'password');

        expect(signupButtn.isEnabled()).toBe(false);

      });

      it('expects login dialog to be displayed', function() {

        signupLink.click();
        showLoginLink.click();
        expect(loginButtn.isDisplayed()).toBe(true);
      });


      it('expects correct validation messages to displayed', function() {

        signupLink.click();

        newEmailFld.sendKeys('hfjshfj@mail');
        newFirstnameFld.sendKeys('hfjshfj');
        newLastnameFld.sendKeys('hfjshfj');
        newPasswordFld.sendKeys('hfjshfj');

        signupButtn.click();

        fieldTextTest(messageFlds.get(2), 'Enter Valid Email');
      });
    });

    describe('Sign up process Test', function() {

      beforeEach(function(done) {
        console.log(config.db);
        mongoose.connect(config.db);
        User.remove({
          email: 'hfjshfj@mail.com'
        }, function(err) {
          if (!err) {
            console.log('User collection removed!');
          }
        });
        done();
      });


      it('expects to be signed in', function() {

        signupLink.click();

        newEmailFld.sendKeys('hfjshfj@mail.com');
        newFirstnameFld.sendKeys('hfjshfj');
        newLastnameFld.sendKeys('hfjshfj');
        newPasswordFld.sendKeys('hfjshfj');

        signupButtn.click();
        fieldTextTest(welcomeLink, 'Welcome hfjshfj');
      });

      it('expects to notify of duplicate user registration attempt', function() {


        var user = new User();
        user.firstname = 'hfjshfj';
        user.lastname = 'hfjshfj';
        user.email = 'hfjshfj@mail.com';
        user.password = '****';
        user.phoneNumber1 = '12345';
        user.gender = 'male';

        user.save(function() {});

        waits(1000);

        signupLink.click();
        newEmailFld.sendKeys('hfjshfj@mail.com');
        newFirstnameFld.sendKeys('hfjshfj');
        newLastnameFld.sendKeys('hfjshfj');
        newPasswordFld.sendKeys('hfjshfj');

        signupButtn.click();
        fieldTextTest(messageFlds.get(3), 'This email is taken');

      });

      afterEach(function(done) {

        User.remove({
          email: 'hfjshfj@mail.com'
        }, function(err) {
          if (!err) {
            console.log('User collection removed!');
          }
        });
        mongoose.disconnect();
        done();
      });
    });
  });



  describe('Login Test', function() {

    beforeEach(function() {
      browser.get('/');
      browser.driver.manage().window().maximize();﻿
    });

    describe('Login page and login validation Test', function() {

      it('expects Login link to be present and as link', function() {
        fieldRenderTest(loginLink, 'a');
        fieldTextTest(loginLink, 'Log in');
      });

      it('expects input fields to be present', function() {

        loginLink.click();

        fieldRenderTest(emailFld, 'input');
        fieldRenderTest(passwordFld, 'input');
        fieldRenderTest(loginButtn, 'button');

        fieldAttribTest(emailFld, 'type', 'email');
        fieldAttribTest(passwordFld, 'type', 'password');

      });

      it('expects signup dialog to be displayed', function() {

        loginLink.click();
        showSignupLink.click();
        expect(signupButtn.isDisplayed()).toBe(true);
      });


      it('should not allow user to log in with wrong email', function() {

        loginLink.click();

        emailFld.sendKeys('hfjshfj1@mail');
        passwordFld.sendKeys('hfjshfj');

        loginButtn.click();

        fieldTextTest(messageFlds.get(0), 'This email is not registered');
      });
    });

    describe('Log in process Test', function() {

      beforeEach(function(done) {

        mongoose.connect(config.db);
        User.remove({}, function(err) {

          if (!err) {
            console.log('User collection removed!');
          }
        });
        done();
      });


      it('should not allow user sign in with wrong password', function() {

        var user = new User();
        user.firstname = 'hfjshfj';
        user.lastname = 'hfjshfj';
        user.email = 'hfjshfj@mail.com';
        user.password = '****';
        user.phoneNumber1 = '12345';
        user.gender = 'male';

        user.save(function() {});

        waits(1000);

        loginLink.click();

        emailFld.sendKeys('hfjshfj@mail.com');
        passwordFld.sendKeys('hfjshfj2');

        loginButtn.click();

        fieldTextTest(messageFlds.get(1), 'Wrong Password');


      });

      it('should allow user to login with correct credentials', function() {

        var user = new User();
        user.firstname = 'hfjshfj';
        user.lastname = 'hfjshfj';
        user.email = 'hfjshfj@mail.com';
        user.password = 'hfjshfj';
        user.phoneNumber1 = '12345';
        user.gender = 'male';

        user.save(function() {});

        waits(1000);

        loginLink.click();

        emailFld.sendKeys('hfjshfj@mail.com');
        passwordFld.sendKeys('hfjshfj');

        loginButtn.click();
        fieldTextTest(welcomeLink, 'Welcome hfjshfj');

      });


      afterEach(function(done) {

        User.remove({}, function(err) {

          if (!err) {
            console.log('User collection removed!');
          }
        });

        mongoose.disconnect();
        done();
      });
    });
  });


  function fieldRenderTest(field, expectedTagName) {

    expect(field.isDisplayed()).toBe(true);
    field.getTagName().then(function(value) {
      expect(value).toBe(expectedTagName);
    });

  }

  function fieldAttribTest(field, attrib, expectedAtrribValue) {

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
