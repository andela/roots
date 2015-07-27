'use strict';

var UserController = require('../controllers/user.controller');
var ctrl = new UserController();
module.exports = function(app) {
 
  router.route('/')
    .get(function(req, res) {
      return res.send({ success : true, message : 'Mr API'});
    });

   router.route('/users')
    .post(ctrl.userSignup)
    .get(ctrl.getUsers)
    .delete(ctrl.deleteAll);

  app.use(cors(config.corsOptions));

  app.use('/api', router);

  app.use(function(req, res, next) {
    res.status(404).json({error: "The path does not exists"});
    next();
  });
};