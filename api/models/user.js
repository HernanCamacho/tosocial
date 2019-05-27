//Modelo de users

'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
	name: String,
	suname: String,
	nickname: String,
	email: String,
	password: String,
	role: String,
	image: String
});
/*Author: Hernan Mitchel Camacho Valdez*/
module.exports = mongoose.model('User', userSchema);