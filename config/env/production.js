'use strict';

module.exports = {
  db: process.env.MONGOLAB_URI,
  secret: process.env.SESSION_SECRET,
  twitter: {
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  },
  facebook: {
    clientID: process.env.FACEBOOK_CLIENT_ID,   
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET
  },
  cloudinary: {
    cloud_name: process.env.ROOTS_CLOUD_NAME,
    api_key: process.env.ROOTS_API_KEY,   
    api_secret: process.env.ROOTS_API_SECRET
  },
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'X-Requested-With', 'Authorization']
  }
};