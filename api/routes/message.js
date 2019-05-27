'use strict'

var express = require('express');
var MessageController = require('../controllers/message');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.get('/probando-dm', md_auth.ensureAuth, MessageController.probando);
api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
api.get('/my-messages/:page?', md_auth.ensureAuth, MessageController.getReceivedMessages);
api.get('/messages/:page?', md_auth.ensureAuth, MessageController.getEmittedMessages);
api.get('/unviewed-messages/:page?', md_auth.ensureAuth, MessageController.getUnviewedMessage);
api.get('/set-viewed-messages/:page?', md_auth.ensureAuth, MessageController.setViewedMessages);
/*Author: Hernan Mitchel Camacho Valdez*/
module.exports = api;