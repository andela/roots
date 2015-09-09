'use strict';

module.exports = {
  db: 'mongodb://localhost/eventroot',
  secret: process.env.ROOTS_SESSION_SECRET,
  twitter: {
    consumerKey: process.env.ROOTS_TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.ROOTS_TWITTER_CONSUMER_SECRET
  },
  google: {
    clientID: process.env.ROOTS_GOOGLE_CLIENT_ID,
    clientSecret: process.env.ROOTS_GOOGLE_CLIENT_SECRET
  },
  facebook: {
    clientID: process.env.ROOTS_FACEBOOK_CLIENT_ID,   
    clientSecret: process.env.ROOTS_FACEBOOK_CLIENT_SECRET
  },
  cloudinary: {
    cloud_name: process.env.ROOTS_CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.ROOTS_CLOUDINARY_API_KEY,   
    api_secret: process.env.ROOTS_CLOUDINARY_API_SECRET
  },
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'X-Requested-With', 'Authorization']
  }
};