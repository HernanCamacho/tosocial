'use strict'

// var path = require('path');
// var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

function saveFollow(req,res){
	var params = req.body;
	var follow = new Follow();
	follow.user = req.user.sub; //id del usuario identificado
	follow.followed = params.followed;

	follow.save((err, followStored) =>{
		if(err) return res.status(500).send({message: 'Error al guardar el seguimiento'});
		if(!followStored) return res.status(404).send({message:'El seguimiento no se ha guardado'});

		return res.status(200).send({follow:followStored});
	});



}

function deleteFollow(req,res){
	var userId = req.user.sub; //usuario logueado .sub -> id
	var followId = req.params.id;//usuario que dejaremos de seguir
	console.log(req.params);

	Follow.find({'user': userId, 'followed': followId}).remove(err =>{
		if(err) return res.status(500).send({message: 'Error al dejar de seguir'});
		return res.status(200).send({message: 'el follow se ha eliminado'});
	});
}

function getFollowingUsers(req, res){
	var userId = req.user.sub;

	if(req.params.id && req.params.page){
		userId = req.params.id;
	}

	var page = 1;

	if(req.params.page){
		page = req.params.page;
	}else{
		page = req.params.id;
	}

	var  itemsPerPage = 4;

	Follow.find({user: userId}).populate({path: 'followed'}).paginate(page, itemsPerPage, (err, follows, total)=>{
		if(err) return res.status(500).send({message: 'Error en el servidor'});
		if(!follows) return res.status(404).send({message:'No sigues a nadie :('});
		/*Author: Hernan Mitchel Camacho Valdez*/

		followUserIds(req.user.sub).then((value) => {

			return res.status(200).send({
				total: total,
				pages: Math.ceil(total/itemsPerPage),
				follows,
				users_following: value.following,
				users_follow_me: value.followed
			});
		});
	});

}

async function followUserIds(user_id){
	try{
		var following = await Follow.find({"user": user_id}).select({'_id': 0, '__v':0, 'password':0}).exec().then((follows) => {

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


		var followed = await Follow.find({"followed": user_id}).select({'_id': 0, '__v':0, 'password':0}).exec().then((follows) => {

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

function getFollowedsUser(req,res){
	var userId = req.user.sub;

	if(req.params.id && req.params.page){
		userId = req.params.id;
	}

	var page = 1;

	if(req.params.page){
		page = req.params.page;
	}else{
		page = req.params.id;
	}

	var  itemsPerPage = 4;

	Follow.find({followed: userId}).populate('user').paginate(page, itemsPerPage, (err, follows, total)=>{
		if(err) return res.status(500).send({message: 'Error en el servidor'});/*Author: Hernan Mitchel Camacho Valdez*/
		if(!follows) return res.status(404).send({message:'No te sigue ningún usuario :('});
		followUserIds(req.user.sub).then((value) => {
			return res.status(200).send({
				total: total,
				pages: Math.ceil(total/itemsPerPage),
				follows,
				users_following: value.following,
				users_follow_me: value.followed
			});
		});
	});

}

//Devolver usuarios que sigo o me siguen
function getMyFollows(req,res){
	var userId = req.user.sub;

	var find = Follow.find({user: userId});

	if(req.params.followed){
		find = Follow.find({followed: userId});
	}
	
	find.populate('user followed').exec((err, follows)=>{
		if(err) return res.status(500).send({message: 'Error en el servidor'});
		if(!follows) return res.status(404).send({message:'No sigues a nadie :('});
		return res.status(200).send({follows});
	});
}


module.exports = {
	saveFollow,
	deleteFollow,
	getFollowingUsers,
	getFollowedsUser,
	getMyFollows
}