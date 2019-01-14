'use strict';

var status = require('app/configs/status');

var authsService = require('app/services/auths');
var path = require('path');

var config = require('app/configs/config');

var login = function (req, res, next) {
  if (!req.body.email || !req.body.password) {
    return next(status.getStatus('input_missing'));
  }

  var loginParams = {};
  loginParams.email = req.body.email;
  loginParams.password = req.body.password;
  loginParams.originId = parseInt(req.headers['x-origin']);
  loginParams.version = parseInt(req.headers['x-version']);

  authsService.login(loginParams, function (err, result) {
    if (err) {
      return next(err);
    }

    return res.json(result);
  });
};

var logout = function (req, res, next) {
  var logoutParams = {};
  logoutParams.sessionToken = req.headers['x-auth'];

  authsService.logout(logoutParams, function (err, result) {
    if (err) {
      return next(err);
    
    }

    return res.json(result);
  });
};


var signup = function (req, res, next) {
  if (req.query.type === 'email' && req.query.action === 'check') {
    var params = {};
    params.email = req.query.email;
    authsService.checkEmail(params, function (err, result) {
      if (err) {
        return next(err);
      }
      return res.json(result);
    });
  } else if (req.query.type === 'token' && req.query.action === 'verify') {
    var params = {};
    params.token = req.query.token;
    authsService.validateToken(params, function (err, result) {
      var templateParams = {};
      templateParams.host = config.host;
      templateParams.weblinkHostName = config.weblinkHostName;
      if (err) {
        if (err.code === 'invalid_token') {
          return res.render('invalid_token', {
            'params': templateParams
          });
        } else if (err.code === 'token_already_used') {
          return res.render('token_verified', {
            'params': templateParams
          });
        } else {
          next(err);
        }
      }
      if (result.code === 'success') {
        return res.render('setPass', result.data);
      }
    });
  } else if (req.query.type === 'password' && req.query.action === 'set' || req.query.action === 'change') {
    if (!req.query.password || !req.query.email) {
      return next(status.getStatus('input_missing'));
    }

    var params = {};
    params.email = req.query.email;
    params.password = req.query.password;
    authsService.setPassword(params, function (err, result) {
      var templateParams = {};
      templateParams.host = config.host;
      templateParams.weblinkHostName = config.weblinkHostName;
      if (err) {
        return next(err);
      }
      if (req.query.action === 'set') {
        return res.render('pswd_set_successfully', {
          'params': templateParams
        });
      } else if (req.query.action === 'change') {
        return res.json(result);
      }
    });
  } else if (req.query.type === 'password' && req.query.action === 'forget') {
    var params = {};
    params.email = req.query.email;
    authsService.forgetPassword(params, function (err, result) {
      if (err) {
        return next(err);
      }
      return res.json(result);
    });
  } else {
    return next(status.getStatus('input_missing'));
  }
};

module.exports = {
  login: login,
  logout: logout,
  signup: signup,
};
