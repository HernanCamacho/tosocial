'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = Schema({
	text: String,
	created_at: String,
	user: {type: Schema.ObjectId, ref: 'User'},
	publication: {type: Schema.ObjectId, ref: 'Publication'} 
});
/*Author: Hernan Mitchel Camacho Valdez*/
module.exports = mongoose.model('Comment', commentSchema);