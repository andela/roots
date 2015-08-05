'use strict';

module.exports = {
  db: 'mongodb://localhost/event-db-test',
  secret: 'supersecret',
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'X-Requested-With', 'Authorization']
  }
};
