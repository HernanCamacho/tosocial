//Código para acceder a mongodb schema

'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800; //puerto estatico para trabajar

//Metodo de promesa -Conexion db
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/pi',{useMongoClient:true})
	.then(() => {
		console.log('La conexión a la bd se ha realizado correctamente');
		//Crear servidor
		app.listen(port, ()=>{
			console.log('Servidor corriendo en http://localhost:3800');
		});
	})
	.catch(err => console.log(err)); 
	/*Author: Hernan Mitchel Camacho Valdez*/