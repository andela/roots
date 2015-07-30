'use strict';

module.exports = {
  db: 'mongodb://localhost/eventroot',
  secret: 'supersecret',
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'X-Requested-With', 'Authorization']
  }
};