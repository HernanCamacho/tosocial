'use strict'

var jwt = require('jwt-simple');//Nos sirve para crear tokens
var moment = require('moment');//Nos sirve para las fechas
var secret = 'clave_secreta_pi_hernan';//Solo lo sabemos nosotros a nivel backend

exports.createToken = function(user){
	var payload = {
		sub: user._id,
		name: user.name,
		suname: user.suname,
		nickname: user.nickname,
		email: user.email,
		role: user.role,
		image: user.image,
		iat: moment().unix(),
		exp: moment().add(30, 'days').unix
	};
/*Author: Hernan Mitchel Camacho Valdez*/
	return jwt.encode(payload, secret);
};

