'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Comment = require('../models/comment');
var User = require('../models/user');
var Follow = require('../models/follow');

function probando(req,res){
	res.status(200).send({message:'Hola desde el controlador de comentarios'});
}

function saveComment(req, res){
	var params = req.body;
	if(!params.text) return res.status(200).send({message: 'Debes enviar texto en el comentario'});

	var comment = new Comment();
	comment.text = params.text;
	comment.created_at = moment().unix();
	comment.user = req.user.sub;
	comment.publication = params._id;

	comment.save((err, commentStored)=>{
		if(err) return res.status(500).send({message: 'Error al guardar el comentario'});
		if(!commentStored) return res.status(404).send({message:'El comentario no ha sido guardado'});
		return res.status(200).send({comment: commentStored});
	});

}

function getComment(req, res){
	var commentId = req.params.id;

	Comment.findById(commentId, (err, comment)=>{
		if(err) return res.status(500).send({message:'Erro al devolver comentarios'});
		if(!comment) return res.status(404).send({message:'Esta publicacion no tiene comentarios'});
		return res.status(200).send({comment});

	});
}

function deleteComment(req, res){
	var commentId = req.params.id;
	var params = req.body;
	/*Author: Hernan Mitchel Camacho Valdez*/

	Comment.find({'publication': params.publication, '_id': commentId}).remove(err =>{
		if(err) return res.status(500).send({message: 'Error al eliminar la publicacion'});

		return res.status(200).send({message:'Comentario eliminado correctamente'});

	});
}

module.exports={
	probando,
	saveComment,
	getComment,
	deleteComment
}