var app = require('../server');
var request = require('supertest');

describe('Event management app', function() {

  //testing testing
  describe('User route',function() {
    it('should be defined', function(done) {
      request(app)
        .get('/api/users')
        .expect(200)
        .expect('content-type', /json/)
        .end(function(err, res) {
          expect(err).toBe(null);
          done();
        });
    });
  });
});