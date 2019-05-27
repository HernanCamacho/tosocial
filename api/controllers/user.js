//Controlador para usuarios

'use strict'

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');


var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');

var jwt = require('../services/jwt');


// --- pruebas de conexion ---
function home(req, res){
	res.status(200).send({
		message:'Hola mundo desde el servidor NODEJS'
	});
}

function pruebas(req, res){
	res.status(200).send({
		message:'Accion de pruebas en NODEJS'
	});
}


//Metodo para el registro de usuarios
function saveUser(req, res){
	var params = req.body;
	var user = new User();

	if(params.name && params.suname && params.email && params.nickname && params.password){
		user.name = params.name;
		user.suname = params.suname;
		user.nickname = params.nickname;
		user.email = params.email;
		user.role = 'ROLE_USER';
		user.image = null;


		//Controlar que no existan 
		//usuarios duplicados
	User.find({ $or: [
				{email: user.email.toLowerCase()},
				{nickname: user.nickname.toLowerCase()}
		]}).exec((err, users) =>{
			if(err) return res.status(500).send({message: 'Error en la peticion de usuarios'});

			if(users && users.length >= 1){
				return res.status(200).send({message: 'El usuario que intenta registrar ya existe'});
			}else{

		        //Cifra la password y guarda los datos
				bcrypt.hash(params.password, null, null, (err, hash) =>{
					user.password = hash;

					user.save((err, userStored) =>{
						if(err) return res.status(500).send({message: 'Error al guardar el usuario'});

						if(userStored){/*Author: Hernan Mitchel Camacho Valdez*/
							res.status(200).send({user: userStored});
						}else{
							res.status(404).send({message: 'No se ha registrado el usuario'});
						}

					});
				});
			}
		});


	}else{
		res.status(200).send({
			message: 'Envia todos los campos necesarios'
		});
	}

}

//Metodo para el login
function loginUser(req, res){
	var params = req.body;

	var email = params.email;
	var password = params.password;

	User.findOne({email: email}, (err, user) =>{
		if(err) return res.status(500).send({message :'Error en la petición'});
		if(user){
			bcrypt.compare(password, user.password, (err, check)=>{
				if(check){
					//devolver datos de usuario
					if(params.gettoken){
						//generar y devolver token
						return res.status(200).send({
							token: jwt.createToken(user)
						});

					}else{
						//devolver los datos en claro
						/*Author: Hernan Mitchel Camacho Valdez*/
						user.password = undefined;//Para que la password solo se quede a nivel 
						//de backend y no la devuelva en el json
						return res.status(200).send({user});
					}

				}else{
					//devolver un error
					return res.status(404).send({message:'El usuario no se ha podido identificar'});
				}
			});
		}else{
			return res.status(404).send({message:'El usuario no se ha podido identificar (no está en la bd)!!'});
		}
	});
}

//Conseguir datos de un usuario
function getUser(req, res){
	var userId = req.params.id;

	User.findById(userId, (err, user)=>{
		if(err) return res.status(500).send({message:'Error en la petición'});
		if(!user) return res.status(404).send({message:'El usuario no existe'});

		/*Follow.findOne({"user":req.user.sub, "followed": userId}).exec((err,follow)=>{
			if(err) return res.status(500).send({message:'Error al comprobar el seguimiento'});
			return res.status(200).send({user, follow});
		});*/


		followThisUser(req.user.sub, userId).then((value)=>{
			// Por seguridad no devuelve el password
			
			return res.status(200).send({
				user,
				following:value.following,
				followed: value.followed
			});
			
		});

			
		

	}).select({'__v':0,'password':0, 'role':0});
}

//funcion asincrona
async function followThisUser(identity_user_id, user_id){
    try {
        var following = await Follow.findOne({ user: identity_user_id, followed: user_id}).exec()
            .then((following) => {
                // console.log(following);
                return following;
            })
            .catch((err)=>{
                return handleerror(err);
            });
        var followed = await Follow.findOne({ user: user_id, followed: identity_user_id}).exec()
            .then((followed) => {
                // console.log(followed);
                return followed;
            })
            .catch((err)=>{
                return handleerror(err);
            });
        return {
            following: following,
            followed: followed
        }
    } catch(e){
        console.log(e);
    }
}

//Metodo para devolver un listado de usuarios paginados
function getUsers(req, res){
	var identity_user_id = req.user.sub; //jwt.js
	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var itemsPerPage = 5; //usuarios por pagina
	// user.password = undefined;
	//sort es para ordenar
	User.find().select({'__v':0, 'password':0}).sort('_id').paginate(page, itemsPerPage, (err, users, total) =>{
		if(err) return res.status(500).send({message:'Error en la petición'});
		if(!users) return res.status(404).send({message:'No hay usuarios disponibles'});
		followUserIds(identity_user_id).then((value) => {


			return res.status(200).send({
				users, //users: users
				users_following: value.following,
				users_follow_me: value.followed,
				total, //total:total
				pages: Math.ceil(total/itemsPerPage)
			});

		});

	});

}

//Funcion de promesa para devolver el listado limpio
async function followUserIds(user_id){
	try{
		var following = await Follow.find({"user": user_id}).select({'_id': 0, '__v':0, 'user':0}).exec().then((follows) => {

			var follows_clean = [];

			follows.forEach((follow) =>{
				follows_clean.push(follow.followed);
			});
			console.log(follows_clean);
			return follows_clean;
		})
		.catch((err) =>{
			return handleerror(err);
		});


		var followed = await Follow.find({"followed": user_id}).select({'_id': 0, '__v':0, 'followed':0}).exec().then((follows) => {

			var follows_clean = [];

			follows.forEach((follow) =>{
				follows_clean.push(follow.user);
			});
			console.log(follows_clean);
			return follows_clean;
		})
		.catch((err) =>{
			return handleerror(err);
		});

		return {
            following: following,
            followed: followed
        }

	}catch(e){
        console.log(e);
    }
}
// este
function getUsersClean(req, res){
	var page = 1;
	if(req.params.page){
		page = req.params.page;
	}

	var itemsPerPage = 4;

	User.find().select({'_v':0}).select({'password':0}).sort('_id').paginate(page, itemsPerPage, (err, users, total)=>{
		if(err) return res.status(500).send({message:'Error en la petición getUsersClean'});
		if(!users) return res.status(404).send({message: 'No hay ningún user registrado'});
		return res.status(200).send({
			users,
			total,
			pages: Math.ceil(total/itemsPerPage)
		});
	});

}

function getCounters(req, res){
	var userId = req.user.sub;

	if(req.params.id){
		userId = req.params.id;
	}
	getCountFollow(userId).then((value) => {
		return res.status(200).send(value);
	});
	
}

async function getCountFollow(user_id){
	try {
		var following = await Follow.count({"user": user_id}).exec().then((count) =>{
			return count;
		})
		.catch((err)=>{
			return handleerror(err);
		});

		var followed = await Follow.count({"followed": user_id}).exec().then((count) =>{
			return count;
		})
		.catch((err)=>{
			return handleerror(err);
		});

		var publications = await Publication.count({"user": user_id}).exec().then((count) =>{
			return count;
		})
		.catch((err)=>{
			return handleerror(err);
		});

		return{
			following: following,
			followed: followed,
			publications: publications
		}
		
	} catch(e) {
		// statements
		console.log(e);
	}
	

}

//este
//Edicion de datos de usuario
function updateUser(req, res){
	var userId = req.params.id;
	var update = req.body;

	//borrar la propiedad password para que no la solicite
	delete update.password;

	if(userId != req.user.sub){
		return res.status(500).send({message:'No tienes permiso para actualizar este perfil'});
	}

	User.find({ $or: [
				{email: update.email},
				{nickname: update.nickname}
		]}).exec((err, users) =>{
			console.log(users);
			var user_isset = false;
			users.forEach((user) =>{
				if(user && user._id != userId) user_isset = true;
			});			

			if(user_isset) return res.status(404).send({message:'El correo o el apodo que intentas ingresar ya están en uso, intenta otro.'});

			//{new:true} me devuelve el objeto actualizado
			User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated)=>{
				if(err) return res.status(500).send({message:'Error en la petición'});
				if(!userUpdated) return res.status(404).send({message:'No se ha podido actualizar el usuario'});

				return res.status(200).send({user: userUpdated});

			});
		});

}


//Subir archivos de imagen/avatar de usuario
function uploadImage(req, res){

	var userId = req.params.id;

	//borrar la propiedad password para que no la solicite

	//Si se envian ficheros
	if(req.files){
		var file_path = req.files.image.path;
		// console.log(file_path);

		//Devuelve un array donde esta la imagen
		var file_split = file_path.split('\\');

		//posicion del nombre de la imagen
		var file_name = file_split[2];


		//obtener el tipo de archivo
		var ext_split = file_name.split('\.');
		//devuelve el array con el nombre y el tipo de archivo
		
		var file_ext = ext_split[1];

		if(userId != req.user.sub){
			return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar este perfil');
		}

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){

			//actualizar documento de usuario logueado

			User.findByIdAndUpdate(userId, {image: file_name}, { new:true}, (err, userUpdated) =>{

				if(err) return res.status(500).send({message:'Error en la petición'});
				if(!userUpdated) return res.status(404).send({message:'No se ha podido actualizar el usuario'});

				// res.user.password = undefined;
				return res.status(200).send({user: userUpdated});

			});

		}else{
			return removeFilesOfUploads(res, file_path, 'Extensión no valida');

		}

	}else{
		return res.status(200).send({message: 'No se ha subido la imagen '});
	}

}

function removeFilesOfUploads(res, file_path, message){
	//Borrar el archivo
	fs.unlink(file_path, (err) =>{
		//Devolver que la extensión no es valida
		return res.status(200).send({message: message});
	});
}

function getImageFile(req, res){
	var image_file = req.params.imageFile;

	var path_file = './uploads/users/' + image_file;

	fs.exists(path_file, (exists)=>{
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({message: 'No existe la imagen!'});
		}
	});

}

module.exports = {
	home,
	pruebas,
	saveUser,
	loginUser,
	getUser,
	getUsers,
	getUsersClean,
	getCounters,
	updateUser,
	uploadImage,
	getImageFile
}