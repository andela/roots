var app = require('../server');
var request = require('supertest')(app);

describe('Event management app', function() {

  it('default route should be defined', function(done) {
    request.get('/')
      .expect(200)
      .expect('content-type', /json/)
      .end(function(err, res) {
        expect(err).toBe(null);
        done();
      });
  });
});