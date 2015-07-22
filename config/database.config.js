
module.exports= {
  test: 'mongodb://localhost/event-db-test',
  development: 'mongodb://localhost/eventroot',
  production: process.env.MONGOLAB_URI
};