'use strict';

module.exports = {
  db: 'mongodb://localhost/event-db-test',
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
<<<<<<< HEAD
    cloud_name: process.env.ROOTS_CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.ROOTS_CLOUDINARY_API_KEY,   
    api_secret: process.env.ROOTS_CLOUDINARY_API_SECRET
=======
    cloud_name: process.env.ROOTS_CLOUD_NAME,
    api_key: process.env.ROOTS_API_KEY,   
    api_secret: process.env.ROOTS_API_SECRET
>>>>>>> feat(main app): frontend
  },
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'X-Requested-With', 'Authorization']
  }
};