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

Utils.prototype.syncLoop = function(iterationNum, process, exit, syncData, syncData2) {

  //syncData and syncData2 are parameters passed to this function that are meant to be processed by the process and/or exit callbacks. syncData2 is not mandatory

  var index = 0,
    done = false,
    shouldExit = false;
  var loop = {
    //next function executes the process param(function to be iterated) recursively for iterationNum of times
    //except break function is called to terminate the process
    next: function() {
      if (done) {
        if (shouldExit && exit) {
          return exit(syncData, syncData2);
        } else {
          return;
        }
      }
      if (index < iterationNum) {
        index++;
        process(loop, syncData, syncData2);
      } else {
        done = true;
        if (exit) exit(syncData, syncData2);
      }
    },
    //this returns the nth iteration in sync with
    //zero based array index
    iteration: function() {
      return index - 1;
    },
    //this terminates the iteration process
    break: function(end) {
      done = true;
      shouldExit = end;
    }
  };
  loop.next();
  return loop;
}

Utils.prototype.convertToObject = function(objectToConvert) {

  try {
    
    var convertedObject = JSON.parse(JSON.stringify(objectToConvert));
    return convertedObject;
  } catch (err) {
    return null;
  }
}

module.exports = Utils;
