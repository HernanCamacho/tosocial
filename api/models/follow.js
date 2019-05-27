
'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var followSchema = Schema({
	user: {type: Schema.ObjectId, ref: 'User'},
	followed: {type: Schema.ObjectId, ref: 'User'}
});
/*Author: Hernan Mitchel Camacho Valdez*/
module.exports = mongoose.model('Follow', followSchema);