'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var  messageSchema = Schema({
	text: String,
	viewed: String,
	created_at: String,
	emitter: {type: Schema.ObjectId, ref: 'User'},
	receiver: {type: Schema.ObjectId, ref: 'User'}
});
/*Author: Hernan Mitchel Camacho Valdez*/
module.exports = mongoose.model('Message', messageSchema);