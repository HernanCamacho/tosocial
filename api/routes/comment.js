'use strict'

var express = require('express');
var CommentController = require('../controllers/comment');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var multiparty = require('connect-multiparty');

api.get('/probando-comm', md_auth.ensureAuth, CommentController.probando);
api.post('/comment', md_auth.ensureAuth, CommentController.saveComment);
api.get('/comment/:id', md_auth.ensureAuth, CommentController.getComment);
api.delete('/comment/:id', md_auth.ensureAuth, CommentController.deleteComment);
/*Author: Hernan Mitchel Camacho Valdez*/
module.exports = api;