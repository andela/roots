var auth = {};
auth.facebook = {};

auth.facebook.test = {
  'clientID': '944559605567223', // your App ID
  'clientSecret': 'c7ea94172e941a7a0b01804181bd2d98', // your App Secret
  'callbackURL': 'http://localhost:2015/auth/facebook/callback'
};

auth.facebook.development = {
  'clientID': '944559605567223', // your App ID
  'clientSecret': 'c7ea94172e941a7a0b01804181bd2d98', // your App Secret
  'callbackURL': 'http://localhost:2015/auth/facebook/callback'
};

auth.facebook.production = {
  'clientID': '944559605567223', // your App ID
  'clientSecret': 'c7ea94172e941a7a0b01804181bd2d98', // your App Secret
  'callbackURL': 'http://localhost:2015/auth/facebook/callback'
};

module.exports = auth;
