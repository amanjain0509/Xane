'use strict';

var express = require('express');
var router = express.Router();

var controller = require('app/controllers/auths');

router.post('/login', controller.login);
router.put('/logout', controller.logout);
router.get('/signup',controller.signup);

module.exports = router;
