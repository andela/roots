'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
  firstname: {type: String, required: true},
  lastname: {type: String, required: true},
  email: {type: String, required: true, index: {unique: true}},
  password: {type: String, required: true},
});

//hash password
userSchema.pre('save', function(next) {
	var user = this;
	//hash the password only if the password has been changed or user is new
	if(!user.isModified('password')) 
		return next();
	//generate the hash
	bcrypt.hash(user.password, null, null, function(err, hash) {
		if (err) return next(err);
		//change the password to the hashed version
		user.password = hash;
		next();
	})
})

userSchema.methods.comparePassword = function(password) {
	var user = this;

	return bcrypt.compareSync(password, user.password);
}

mongoose.model('User', userSchema);