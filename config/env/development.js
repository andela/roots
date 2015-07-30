'use strict';

module.exports = {
  db: 'mongodb://localhost/eventroot',
  secret: 'supersecret',
  twitter : {
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET
  },
  google : {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  },
  facebook : {
    clientID: process.env.FACEBOOK_CLIENT_ID,   
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET
  },
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'X-Requested-With', 'Authorization']
  }
};