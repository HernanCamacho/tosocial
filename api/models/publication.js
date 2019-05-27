'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var publicationSchema = Schema({
	text: String,
	file: String,
	created_at: String,
	user: {type: Schema.ObjectId, ref: 'User'}
});
/*Author: Hernan Mitchel Camacho Valdez*/
module.exports = mongoose.model('Publication', publicationSchema);