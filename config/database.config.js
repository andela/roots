
module.exports= {
  test: 'mongodb://localhost/event-db-test',
  staging: process.env.MONGOLAB_URI,
  development: 'mongodb://localhost/eventroot',
  production: process.env.MONGOLAB_URI,
  secret: process.env.SESSION_SECRET
};