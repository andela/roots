var nodemailer = require('nodemailer');

var Utils = function() {};

Utils.prototype.sendMail = function(mailOptions, done){

  var transporter = nodemailer.createTransport();
  var result = {};
  
  transporter.sendMail(mailOptions, function(err, res) {
    if (err) {
      result.err = err;
    } else {
      result.res = res;
    }
    if (done)
      done(err);
    return result;
  });

}

module.exports = Utils;
