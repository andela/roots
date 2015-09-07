'use strict';

var request = require('supertest');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');
var User = require('../../../../app/models/user.model');
var Event = require('../../../../app/models/event.model');
var Task = require('../../../../app/models/task.model');

var config = require('../../../../config/config');

var app = express();
var router = express.Router();

var user;
var evt;
var task;
var token;

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

require('../../../../app/routes/index')(router);

app.use(router);

describe('Event Model', function(done) {

  beforeEach(function(done) {
    User.remove({}, function(err) {
      Event.remove({}, function(err) {
        Task.remove({}, function(err) {
          done();
        });
      });
    });
  });

  describe('Create task', function() {
    beforeEach(function(done) {
      user = new User();
      user.firstname = 'dame';
      user.lastname = 'matt';
      user.email = 'matt@gmail.com';
      user.password = 'mattdame';

      evt = new Event();
      evt.name = 'Event name';
      evt.category = 'Event category';
      evt.description = 'description';
      evt.venue = {
        address: 'address'
      };
      evt.startDate = '2015-08-23T18:30:00.000Z';
      evt.endDate = '2015-08-30T18:25:43.511Z';
      evt.eventUrl = 'www.event.com';

      task = new Task();
      task.description = 'Task 1';
      task.startDate = '2015-08-23T18:30:00.000Z';
      task.endDate = '2015-08-23T19:25:43.511Z';

      done();
    });


    it('should not create task without token', function(done) {

      user.save(function(err) {

        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);

            if (!err) {
              task.manager_ref = user._id;

              request(app)
                .post('/api/event/' + evt._id + '/tasks')
                .set('Content-Type', 'application/json')
                .send({
                  newTask: task
                })
                .expect(403)
                .end(function(err, response) {
                  expect(response.body).toEqual(jasmine.objectContaining({
                    success: false,
                    message: 'No token provided.'
                  }));
                  done();
                });

            } else {
              done();
            }
          });
        } else {
          done();
        }
      });
    });

    it('should not create task without newTask object', function(done) {

      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);

            if (!err) {
              task.manager_ref = user._id;
              request(app)
                .post('/api/event/' + evt._id + '/tasks')
                .set('Content-Type', 'application/json')
                .send({
                  token: token,
                  task: task
                })
                .expect(403)
                .end(function(err, response) {

                  expect(response.body).toEqual(jasmine.objectContaining({
                    success: false,
                    message: 'Check parameters!'
                  }));
                  done();
                });

            } else {
              done();
            }
          });
        } else {
          done();
        }
      });
    });

    it('should not create task with invalid event id', function(done) {

      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        expect(err).toBe(null);

        if (!err) {

          task.manager_ref = user._id;
          request(app)
            .post('/api/event/1a1a1a1a1a1a1a1a1a1a1a1a/tasks')
            .set('Content-Type', 'application/json')
            .send({
              token: token,
              newTask: task
            })
            .expect(422)
            .end(function(err, response) {

              expect(response.body).toEqual(jasmine.objectContaining({
                success: false,
                message: 'Event not found!'
              }));
              done();
            });

        } else {
          done();
        }
      });
    });

    it('should not create task without manager_ref', function(done) {

      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);

            if (!err) {

              request(app)
                .post('/api/event/' + evt._id + '/tasks')
                .set('Content-Type', 'application/json')
                .send({
                  token: token,
                  newTask: task
                })
                .expect(200)
                .end(function(err, response) {

                  expect(response.body).toEqual(jasmine.objectContaining({
                    success: false,
                    message: 'No manager id specified!'
                  }));
                  done();
                });

            } else {
              done();
            }
          });
        } else {
          done();
        }
      });
    });

    it('should create task', function(done) {

      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);

            if (!err) {
              task.manager_ref = user._id;
              request(app)
                .post('/api/event/' + evt._id + '/tasks')
                .set('Content-Type', 'application/json')
                .send({
                  token: token,
                  newTask: task
                })
                .expect(200)
                .end(function(err, response) {

                  expect(response.body).toEqual(jasmine.objectContaining({
                    description: 'Task 1',
                    startDate: '2015-08-23T18:30:00.000Z',
                    endDate: '2015-08-23T19:25:43.511Z'
                  }));
                  done();
                });

            } else {
              done();
            }
          });
        } else {
          done();
        }
      });
    });


    it('should not create duplicate task', function(done) {

      user.save(function(err) {

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);

            if (!err) {

              task.manager_ref = user._id;
              task.event_ref = evt._id

              task.save(function(err) {

                if (!err) {

                  var taskTwo = new Task();
                  taskTwo.description = 'task 1';
                  taskTwo.startDate = '2015-08-23T18:30:00.000Z';
                  taskTwo.endDate = '2015-08-23T19:25:43.511Z';

                  taskTwo.manager_ref = user._id;
                  request(app)
                    .post('/api/event/' + evt._id + '/tasks')
                    .set('Content-Type', 'application/json')
                    .send({
                      token: token,
                      newTask: taskTwo
                    })
                    .expect(422)
                    .end(function(err, response) {

                      expect(response.body).toEqual(jasmine.objectContaining({
                        success: false,
                        message: 'There is another event task with same description!'
                      }));
                      done();
                    });
                } else {
                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      });
    });
  });


  describe('Edit task', function() {
    beforeEach(function(done) {
      user = new User();
      user.firstname = 'dame';
      user.lastname = 'matt';
      user.email = 'matt@gmail.com';
      user.password = 'mattdame';

      evt = new Event();
      evt.name = 'Event name';
      evt.category = 'Event category';
      evt.description = 'description';
      evt.venue = {
        address: 'address'
      };
      evt.startDate = '2015-08-23T18:30:00.000Z';
      evt.endDate = '2015-08-30T18:25:43.511Z';
      evt.eventUrl = 'www.event.com';

      task = new Task();
      task.description = 'Task 1';
      task.startDate = '2015-08-23T18:30:00.000Z';
      task.endDate = '2015-08-23T19:25:43.511Z';

      done();
    });

    it('should not edit task without newTask object', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  var taskTwo = new Task();
                  taskTwo.description = 'task 1';
                  taskTwo.startDate = '2015-08-23T18:30:00.000Z';
                  taskTwo.endDate = '2015-08-23T19:25:43.511Z';

                  taskTwo.manager_ref = user._id;
                  request(app)
                    .put('/api/event/' + evt._id + '/task/' + task._id)
                    .set('Content-Type', 'application/json')
                    .send({
                      token: token,
                      task: taskTwo
                    })
                    .expect(422)
                    .end(function(err, response) {

                      expect(response.body).toEqual(jasmine.objectContaining({
                        success: false,
                        message: 'Check parameters!'
                      }));
                      done();
                    });

                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });

    it('should not edit with invalid event invalid', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  var taskTwo = new Task();
                  taskTwo.description = 'task 1';
                  taskTwo.startDate = '2015-08-23T18:30:00.000Z';
                  taskTwo.endDate = '2015-08-23T19:25:43.511Z';

                  taskTwo.manager_ref = user._id;
                  request(app)
                    .put('/api/event/1a1a1a1a1a1a1a1a1a1a1a1a/task/' + task._id + '?token=' + token)
                    .set('Content-Type', 'application/json')
                    .send({
                      token: token,
                      newTask: taskTwo
                    })
                    .expect(422)
                    .end(function(err, response) {

                      expect(response.body).toEqual(jasmine.objectContaining({
                        success: false,
                        message: 'Event not found!'
                      }));
                      done();
                    });

                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });

    it('should not edit with invalid event manager id', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  var taskTwo = new Task();
                  taskTwo.description = 'task 1';
                  taskTwo.startDate = '2015-08-23T18:30:00.000Z';
                  taskTwo.endDate = '2015-08-23T19:25:43.511Z';

                  taskTwo.manager_ref = '1a1a1a1a1a1a1a1a1a1a1a1a';
                  request(app)
                    .put('/api/event/' + evt._id + '/task/' + task._id + '?token=' + token)
                    .set('Content-Type', 'application/json')
                    .send({
                      token: token,
                      newTask: taskTwo
                    })
                    .expect(422)
                    .end(function(err, response) {

                      expect(response.body).toEqual(jasmine.objectContaining({
                        success: false,
                        message: 'Invalid manager id!'
                      }));
                      done();
                    });

                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });

    it('should not edit with invalid task id', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  var taskTwo = new Task();
                  taskTwo.description = 'task 2';
                  taskTwo.startDate = '2015-08-23T18:30:00.000Z';
                  taskTwo.endDate = '2015-08-23T19:25:43.511Z';

                  taskTwo.manager_ref = user._id;
                  request(app)
                    .put('/api/event/' + evt._id + '/task/1a1a1a1a1a1a1a1a1a1a1a1a?token=' + token)
                    .set('Content-Type', 'application/json')
                    .send({
                      newTask: taskTwo
                    })
                    .expect(422)
                    .end(function(err, response) {
                      expect(response.body).toEqual(jasmine.objectContaining({
                        success: false,
                        message: 'Invalid task id!'
                      }));
                      done();
                    });

                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });

    it('should not edit task without newTask object', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  var taskTwo = new Task();
                  taskTwo.description = 'task 1';
                  taskTwo.startDate = '2015-08-23T18:30:00.000Z';
                  taskTwo.endDate = '2015-08-23T19:25:43.511Z';

                  taskTwo.manager_ref = user._id;
                  request(app)
                    .put('/api/event/' + evt._id + '/task/' + task._id + '?token=' + token)
                    .set('Content-Type', 'application/json')
                    .send({
                      token: token,
                      task: taskTwo
                    })
                    .expect(422)
                    .end(function(err, response) {

                      expect(response.body).toEqual(jasmine.objectContaining({
                        success: false,
                        message: 'Check parameters!'
                      }));
                      done();
                    });

                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });

    it('should not edit task without manager_ref prop in the newTask object', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  var taskTwo = new Task();
                  taskTwo.description = 'task 1';
                  taskTwo.startDate = '2015-08-23T18:30:00.000Z';
                  taskTwo.endDate = '2015-08-23T19:25:43.511Z';

                  request(app)
                    .put('/api/event/' + evt._id + '/task/' + task._id + '?token=' + token)
                    .set('Content-Type', 'application/json')
                    .send({
                      token: token,
                      newTask: taskTwo
                    })
                    .expect(422)
                    .end(function(err, response) {

                      expect(response.body).toEqual(jasmine.objectContaining({
                        success: false,
                        message: 'No manager id specified!'
                      }));
                      done();
                    });

                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });


    it('should not edit if there is another event task with same description', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  var taskTwo = new Task();
                  taskTwo.description = 'Task 2';
                  taskTwo.startDate = '2015-08-23T18:30:00.000Z';
                  taskTwo.endDate = '2015-08-23T19:25:43.511Z';

                  taskTwo.manager_ref = user._id;

                  taskTwo.save(function(err) {

                    if (!err) {

                      task.description = 'Task 2'

                      request(app)
                        .put('/api/event/' + evt._id + '/task/' + task._id + '?token=' + token)
                        .set('Content-Type', 'application/json')
                        .send({
                          token: token,
                          task: task
                        })
                        .expect(422)
                        .end(function(err, response) {

                          expect(response.body).toEqual(jasmine.objectContaining({
                            success: false,
                            message: 'There is another event task with same description!'
                          }));
                          done();
                        });

                    } else {
                      done();
                    }
                  });
                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });

    it('should edit task', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  var taskTwo = new Task();
                  taskTwo.description = 'task 2';
                  taskTwo.startDate = '2016-08-23T18:30:00.000Z';
                  taskTwo.endDate = '2016-08-23T19:25:43.511Z';

                  taskTwo.manager_ref = user._id;
                  request(app)
                    .put('/api/event/' + evt._id + '/task/' + task._id + '?token=' + token)
                    .set('Content-Type', 'application/json')
                    .send({
                      newTask: taskTwo
                    })
                    .expect(200)
                    .end(function(err, response) {
                      expect(response.body).toEqual(jasmine.objectContaining({
                        description: 'task 2',
                        startDate: '2016-08-23T18:30:00.000Z',
                        endDate: '2016-08-23T19:25:43.511Z'
                      }));
                      done();
                    });

                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });
  })

  describe('Delete task', function() {
    beforeEach(function(done) {
      user = new User();
      user.firstname = 'dame';
      user.lastname = 'matt';
      user.email = 'matt@gmail.com';
      user.password = 'mattdame';

      evt = new Event();
      evt.name = 'Event name';
      evt.category = 'Event category';
      evt.description = 'description';
      evt.venue = {
        address: 'address'
      };
      evt.startDate = '2015-08-23T18:30:00.000Z';
      evt.endDate = '2015-08-30T18:25:43.511Z';
      evt.eventUrl = 'www.event.com';

      task = new Task();
      task.description = 'Task 1';
      task.startDate = '2015-08-23T18:30:00.000Z';
      task.endDate = '2015-08-23T19:25:43.511Z';

      done();
    });

    it('should not delete task if no token is specified', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  request(app)
                    .delete('/api/event/' + evt._id + '/task/' + task._id)
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .end(function(err, response) {
                      expect(response.body).toEqual(jasmine.objectContaining({
                        success: false,
                        message: 'No token provided.'
                      }));
                      done();
                    });

                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });

    it('should not delete task if incorrect event id is specified', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);
        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  request(app)
                    .delete('/api/event/1a1a1a1a1a1a1a1a1a1a1a1a/task/' + task._id + '?token=' + token)
                    .set('Content-Type', 'application/json')
                    .expect(422)
                    .end(function(err, response) {
                      expect(response.body).toEqual(jasmine.objectContaining({
                        success: false,
                        message: 'Specified event not found!'
                      }));
                      done();
                    });

                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });

    it('should not delete task created by another user', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {



              var user2 = new User();
              user2.firstname = 'dame2';
              user2.lastname = 'matt2';
              user2.email = 'matt2@gmail.com';
              user2.password = 'mattdame2';

              user2.save(function(err) {

                expect(err).toBe(null);
                token = jwt.sign(user2, config.secret, {
                  expiresInMinutes: 1440 //24hr expiration
                });

                if (!err) {

                  task.event_ref = evt._id;
                  task.manager_ref = user._id;

                  task.save(function(err) {

                    expect(err).toBe(null);

                    if (!err) {

                      request(app)
                        .delete('/api/event/' + evt._id + '/task/' + task._id + '?token=' + token)
                        .set('Content-Type', 'application/json')
                        .expect(401)
                        .end(function(err, response) {
                          expect(response.body).toEqual(jasmine.objectContaining({
                            success: false,
                            message: 'Unauthorized!'
                          }));
                          done();
                        });

                    } else {

                      done();
                    }
                  });
                } else {
                  done();
                }
              });

            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });

    it('should delete task', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  request(app)
                    .delete('/api/event/' + evt._id + '/task/' + task._id + '?token=' + token)
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .end(function(err, response) {
                      expect(response.body).toEqual(jasmine.objectContaining({
                        success: true,
                        message: 'Succesfully deleted'
                      }));
                      done();
                    });

                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });
  });

  describe('Get task', function() {
    beforeEach(function(done) {
      user = new User();
      user.firstname = 'dame';
      user.lastname = 'matt';
      user.email = 'matt@gmail.com';
      user.password = 'mattdame';

      evt = new Event();
      evt.name = 'Event name';
      evt.category = 'Event category';
      evt.description = 'description';
      evt.venue = {
        address: 'address'
      };
      evt.startDate = '2015-08-23T18:30:00.000Z';
      evt.endDate = '2015-08-30T18:25:43.511Z';
      evt.eventUrl = 'www.event.com';

      task = new Task();
      task.description = 'Task 1';
      task.startDate = '2015-08-23T18:30:00.000Z';
      task.endDate = '2015-08-23T19:25:43.511Z';

      done();
    });

    it('should not get task without token', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  request(app)
                    .get('/api/event/' + evt._id + '/task/' + task._id)
                    .set('Content-Type', 'application/json')
                    .expect(403)
                    .end(function(err, response) {
                      expect(response.body).toEqual(jasmine.objectContaining({
                        success: false,
                        message: 'No token provided.'
                      }));
                      done();
                    });

                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });

    it('should get task with invalid event id', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  request(app)
                    .get('/api/event/1a1a1a1a1a1a1a1a1a1a1a1a/task/' + task._id + '?token=' + token)
                    .set('Content-Type', 'application/json')
                    .expect(422)
                    .end(function(err, response) {
                      expect(response.body).toEqual(jasmine.objectContaining({
                        success: false,
                        message: 'Invalid Task or Event id'
                      }));
                      done();
                    });

                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });


    it('should get task', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  request(app)
                    .get('/api/event/' + evt._id + '/task/' + task._id + '?token=' + token)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .end(function(err, response) {
                      expect(response.body).toEqual(jasmine.objectContaining({
                        description: 'Task 1',
                        startDate: '2015-08-23T18:30:00.000Z',
                        endDate: '2015-08-23T19:25:43.511Z'
                      }));
                      done();
                    });

                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });

    it('should get all event tasks', function(done) {

      user.save(function(err) {
        expect(err).toBe(null);

        token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 //24hr expiration
        });

        if (!err) {

          evt.user_ref = user._id;

          evt.save(function(err) {

            expect(err).toBe(null);
            if (!err) {

              task.event_ref = evt._id;
              task.manager_ref = user._id;

              task.save(function(err) {

                expect(err).toBe(null);

                if (!err) {

                  var taskTwo = new Task;
                  taskTwo.description = 'Task 2';
                  taskTwo.startDate = '2015-08-23T18:40:00.000Z';
                  taskTwo.endDate = '2015-08-23T19:25:43.511Z';

                  taskTwo.save(function(err) {

                    if (!err) {

                      request(app)
                        .get('/api/event/' + evt._id + '/tasks/?token=' + token)
                        .set('Content-Type', 'application/json')
                        .expect(200)
                        .end(function(err, response) {
                          expect(response.body.length).toEqual(2);
                          done();
                        });
                    } else {
                      done();
                    }
                  });
                } else {

                  done();
                }
              });
            } else {
              done();
            }
          });
        } else {
          done();
        }
      })
    });
  });

});
