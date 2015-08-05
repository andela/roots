'use strict';

module.exports = {
  db: 'mongodb://localhost/event-db-test',
  secret: process.env.ROOTS_SESSION_SECRET,
  google : {
    clientID: process.env.ROOTS_GOOGLE_CLIENT_ID,
    clientSecret: process.env.ROOTS_GOOGLE_CLIENT_SECRET
  },
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'X-Requested-With', 'Authorization']
  }
};