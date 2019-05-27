'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_pi_hernan';//Solo lo sabemos nosotros a nivel backend

exports.ensureAuth = function(req, res, next){
	// console.log(req.headers.authorization);
	if(!req.headers.authorization){
		return res.status(403).send({message: 'La peticion no tiene la cabecera de autenticacion'});
	}

	var token = req.headers.authorization.replace(/['"]+/g,''); //remplazamos las comillas que vengan en el string por ''
	try{
		var payload = jwt.decode(token, secret);
		if(payload.exp <= moment().unix()){
			return res.status(401).send({message: 'El  token ha expirado'});
		}
	}catch(ex){
		/*Author: Hernan Mitchel Camacho Valdez*/
		return res.status(404).send({message: 'El  token no es valido'});
	}

	req.user = payload;

	next();

}