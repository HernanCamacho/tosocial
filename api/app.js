//Creación del servidor 
'use strict'

var express = require('express'); //Nos permite trabajar con el protocolo http
var bodyParser = require('body-parser'); //Cambia los json a objetos de javascript

var app = express(); //Carga el framework

//cargar rutas
var user_routers = require('./routes/user');
var follow_routers = require('./routes/follow');
var publication_routers = require('./routes/publication');
var message_routers = require('./routes/message');
var comment_routers = require('./routes/comment');
//middlewares
app.use(bodyParser.urlencoded({extended:false}));//Necesario del bodyParser
app.use(bodyParser.json());//Al recibir informacion en una petición la convierte en un json

//cors

app.use((req, res, next) => {
	 //en vez de * se puede definir SÓLO los orígenes que permitimos
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    //metodos http permitidos para CORS
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next(); 
});
/*Author: Hernan Mitchel Camacho Valdez*/

// --- pruebas de conexion ---
app.use('/api', user_routers);
app.use('/api', follow_routers);
app.use('/api', publication_routers);
app.use('/api', message_routers);
app.use('/api', comment_routers);

//exportar
module.exports = app;