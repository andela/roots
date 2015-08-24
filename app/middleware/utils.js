var nodemailer = require('nodemailer');

var Utils = function() {};

Utils.prototype.sendMail = function(mailOptions, done) {

  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'worldtree.noreply@gmail.com',
      pass: 'rootsdevelopers'
    }
  });

  var result = {};

  transporter.sendMail(mailOptions, function(err, res) {
    if (err) {
      result.err = err;
    } else {
      result.res = res;
    }
    if (done)
      done(err);
    console.log(result);
    return result;
  });

}

//for executing asynchronous calls that involve iteration

Utils.prototype.syncLoop = function(iterationNum, process, exit, syncData) {

  var index = 0,
    done = false,
    shouldExit = false;
  var loop = {
    next: function() {
      if (done) {
        if (shouldExit && exit) {
          return exit(syncData);
        } else {
          return;
        }
      }
      if (index < iterationNum) {
        index++;
        process(loop, syncData);
      } else {
        done = true;
        if (exit) exit(syncData);
      }
    },
    iteration: function() {
      return index - 1;
    },
    break: function(end) {
      done = true;
      shouldExit = end;
    }
  };
  loop.next();
  return loop;
}

module.exports = Utils;
