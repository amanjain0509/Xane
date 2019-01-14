'use strict';

var status = require('app/configs/status');

var authsService = require('app/services/auths');
var utilsService = require('app/services/utils');

module.exports = function (req, res, next) {
  var allowedActions = ['verify', 'set'];

  if (req._parsedUrl.pathname === '/auths/signup' && allowedActions.indexOf(req.query.action) >= 0){
    return next();
  }
  else{
    if (!req.headers['x-origin'] || !req.headers['x-version']) {
      return next(status.getStatus('headers_missing'));
    }  
  }
  
  var originId = parseInt(req.headers['x-origin']);
  var version = parseInt(req.headers['x-version']);
  var token = req.headers['x-auth'];

  var whitelist = [
    /^\/auths\/(login)$/,
    /^\/auths\/(signup)$/
  ];

  for (var i = 0; i < whitelist.length; i++) {
    if (whitelist[i].test(req.originalUrl.split('?')[0])) {
      return next();
    }
  }

  var validateParams = {};
  validateParams.originId = originId;
  validateParams.version = version;
  validateParams.token = token;

  if (req._parsedUrl.pathname.indexOf('dashboard') > -1) {
    if (originId !== 4) {
      next(status.getStatus('authr_fail'));
    }
  }

  authsService.validateSession(validateParams, function (err, result) {
    if (err) {
      return next(err);
    }

    if (req._parsedUrl.pathname.indexOf('dashboard') > -1) {
      if (result.role_id !== 1) {
        next(status.getStatus('authr_fail'));
      }
    }

    req._user = {};
    req._user.id = result.id;
    req._user.roleId = result.role_id;
    req._user.role = result.role;

    return next();
  });
};