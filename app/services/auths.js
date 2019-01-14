'use strict';

var async = require('async');
var uuid = require('uuid');

var status = require('app/configs/status');

var utilsService = require('app/services/utils');

var authsModel = require('app/models/auths');
var usersModel = require('app/models/users');

var emailService = require('app/services/sendEmail');
var config = require('app/configs/config');

var login = function (params, callback) {
  if (!params.email || !params.password || !params.originId || !params.version) {
    return callback(status.getStatus('input_missing'));
  }

  async.waterfall([
    function (doneCallback) {
      var originVersionParams = {};
      originVersionParams.originId = params.originId;
      originVersionParams.version = params.version;

      _validateOriginVersion(originVersionParams, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        if (!result) {
          return doneCallback(status.getStatus('origin_version_fail'));
        }

        return doneCallback(null);
      });
    },

    function (doneCallback) {
      var credParams = {};
      credParams.email = params.email;
      credParams.password = params.password;

      authsModel.validateCredentials(credParams, function (err, result) {
        if (err) {
          return callback(err);
        }
        if (!result) {
          return callback(status.getStatus('authn_fail'));
        }
        return doneCallback(null, result);
      });
    },

    function (userId, doneCallback) {
      var sessionParams = {};
      sessionParams.userId = userId;
      sessionParams.token = uuid.v4().replace(/\-/g, '');
      sessionParams.originId = params.originId;
      sessionParams.version = params.version;
      sessionParams.expiry = utilsService.addDays(new Date(), 180);

      authsModel.createSession(sessionParams, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        var session = {
          token: sessionParams.token
        };

        return doneCallback(null, userId, session);
      });
    },

    function (userId, session, doneCallback) {
      usersModel.getUserById(userId, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        if (!result) {
          return doneCallback(status.getStatus('user_missing'));
        }

        if(params.originId === 4 && result.role_id !== 1){
          return doneCallback(status.getStatus('user_is_not_admin'));
        }

        var user = {
          id: userId,
          name: result.fullName,
          designation: result.designation,
          role: {
            id: result.role_id,
            role: result.role
          }
        };
        return doneCallback(null,userId, user, session);
      });
    },
    function (user_id,user, session, doneCallback) {
      usersModel.getCompanyNameByUserId(user_id, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        if (!result) {
          return doneCallback(status.getStatus('user_missing'));
        }
        var company ={
          company_id:result.companyid,
          company_name: result.company_name
        };
        return doneCallback(null,company, user_id,user, session);
      });

    },
    function (company,user_id,user, session, doneCallback) {
      var response = status.getStatus('success');
      response.data = {};
      response.data.user = user;
      response.data.session = session;
      response.data.company = company;
      return doneCallback(null, response);
    }
  ], function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  });
};

var logout = function (params, callback) {
  if (!params.sessionToken) {
    return callback(status.getStatus('input_missing'));
  }

  async.waterfall([
    function (doneCallback) {
      authsModel.deactivateSessionByToken(params.sessionToken, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        return doneCallback(null, result);
      });
    },

    function (sessionId, doneCallback) {
      var response = status.getStatus('success');
      response.data = {};
      response.data.session = {};
      response.data.session.id = sessionId;

      return doneCallback(null, response);
    }
  ], function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  });
};

var _validateOriginVersion = function (params, callback) {
  if (!params.originId || !params.version) {
    return callback(status.getStatus('input_missing'));
  }

  authsModel.getOriginById(params.originId, function (err, result) {
    if (err) {
      return callback(err);
    }

    if (!result || params.version <= result.deprecated_version) {
      return callback(status.getStatus('origin_version_fail'));
    } else {
      return callback(null, true);
    }
  });
};

var validateSession = function (params, callback) {
  if (!params.token || !params.originId || !params.version) {
    return callback(status.getStatus('input_missing'));
  }

  async.waterfall([
    function (doneCallback) {
      var originVersionParams = {};
      originVersionParams.originId = params.originId;
      originVersionParams.version = params.version;

      _validateOriginVersion(originVersionParams, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        if (!result) {
          return doneCallback(status.getStatus('authn_fail'));
        } else {
          return doneCallback(null);
        }
      });
    },

    function (doneCallback) {
      authsModel.getSessionByToken(params.token, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        if (!result) {
          return doneCallback(status.getStatus('authn_fail'));
        }

        return doneCallback(null, result);
      });
    },

    function (session, doneCallback) {
      if (!session.active || new Date(session.expiry) <= new Date()) {
        return doneCallback(status.getStatus('authn_fail'));
      }

      var updateParams = {};
      updateParams.sessionId = session.id;
      updateParams.expiry = utilsService.addDays(new Date(), 180);
      updateParams.version = params.version;

      authsModel.updateSession(updateParams, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        session.expiry = updateParams.expiry;
        session.version = updateParams.version;

        return doneCallback(null, session);
      });
    },

    function (session, doneCallback) {
      authsModel.deactivateExpiredActiveSessionsByUserId(session.user_id, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        return doneCallback(null, session);
      });
    },

    function (session, doneCallback) {
      usersModel.getUserById(session.user_id, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        if (!result) {
          return doneCallback(status.getStatus('user_missing'));
        }

        return doneCallback(null, result);
      });
    }
  ], function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  });
};


var checkEmail = function (params, callback) {
  if (!params.email) {
    return callback(status.getStatus('input_missing'));
  }

  async.waterfall([
    function (doneCallback) {
      usersModel.getUserByEmail(params.email, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        if(result === null){
          var domain = params.email.split('@');
          return callback(null,status.getStatus('email_is_not_valid'));
          /* here we will write logic to check domain and create user */
        }
        return doneCallback(null, result);
      });
    },
    function (user, doneCallback) {
      var returnParams = {};
      returnParams.user = user;
      if (user.token_id === null){
        user.context = 'signup';
        user.type = 'generate';
        sendTokenByUserID(user,function(err,result){
          if(err){
            return callback(null,status.getStatus('generic_fail'));
          }
          returnParams.message = 'sent_token';
          return doneCallback(null, returnParams);
        });
      }
      else if(user.active_token){
        user.context = 'signup';
        user.type = 'update';
        sendTokenByUserID(user,function(err,result){
          if(err){
            return callback(null,status.getStatus('generic_fail'));
          }
          returnParams.message = 'sent_token';
          return doneCallback(null, returnParams);
        });
      }
      else{
        returnParams.message = 'user_exist';
        return doneCallback(null, returnParams);
      }
    }
  ], function (err, result) {
    if (err) {
      return callback(err);
    }
    if (result.message === 'sent_token'){
      var response = status.getStatus('email_sent');
      response.data = {};
      response.data.user  = {};
      response.data.user.email = result.user.user_email;
      response.data.user.user_id = result.user.user_id;
      return callback(null,response);
    }
    else if(result.message === 'user_exist'){
      var response = status.getStatus('enter_password');
      response.data = {};
      response.data.user  = {};
      response.data.user.email = result.user.user_email;
      response.data.user.user_id = result.user.user_id;
      return callback(null,response);
    }
    else{
      return callback(null,status.getStatus('generic_fail'));
    }
  });
};


var sendTokenByUserID = function (userToken, callback) {
  if (!userToken) {
    return callback(null,status.getStatus('email_is_not_valid'));
  }

  async.waterfall([
    function (doneCallback) {
      if(userToken.type == 'update'){
        userToken.increasetime = utilsService.addDays(new Date(), 1);
        authsModel.updateToken(userToken, function (err, result) {
          if (err) {
            return doneCallback(err);
          }
          return doneCallback(null,result);
        });
      }
      else if (userToken.type == 'generate'){
        var tokenParams = {}
        tokenParams.token = uuid.v4().replace(/\-/g, '') + uuid.v4().replace(/\-/g, '');
        tokenParams.userId=userToken.user_id;
        tokenParams.expiry = utilsService.addDays(new Date(), 1);
        tokenParams.active = 1;
        tokenParams.context = userToken.context;
        authsModel.createTokenByUserId(tokenParams, function (err, result) {
          if (err) {
            return doneCallback(err);
          }
          return doneCallback(null,result);
        });
      }
    },
    function (token,doneCallback) {
      usersModel.getUserByEmail(userToken.user_email, function (err, result) {
        if (err) {
          return doneCallback(err);
        }
        var emailParams = {};
        emailParams.msg = 'Please create password by link below '+config.host+'auths/signup?type=token&action=verify&token='+result.token;
        emailParams.recieverEmail = result.user_email;
        emailParams.subject = 'Create Password'
        emailService.sendEmail(emailParams,function(err,emailresult){
          if (err){
            callback(status.getStatus('generic_fail'));
          }
          return callback(null,emailresult.response);
        });
      });
    }
  ], function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  });
};


var validateToken = function (tokenParams, callback) {
  if (!tokenParams) {
    return callback(null,status.getStatus('input_missing'));
  }
  authsModel.getTokenDetail(tokenParams.token, function (err, result) {
    if (err) {
      return callback(null,status.getStatus('generic_fail'));
    }
    if(result === null){
      return callback(status.getStatus('invalid_token'));
    }
    else if(result.user_id){
      if(!result.token_active || new Date(result.token_expiry) <= new Date()){
        return callback(status.getStatus('token_already_used'));
      }
      else{
        var response  =status.getStatus('success');
        response.data = {};
        response.data.user = {};
        response.data.user.user_id = result.user_id;
        response.data.user.user_email = result.user_email;
        authsModel.deactivateToken(result, function (err, result) {
          if (err) {
            return callback(null,status.getStatus('generic_fail'));
          }
          return callback(null,response);
        });
      }
    }
    else{
      return callback(status.getStatus('invalid_token'));
    }
  });
};


var setPassword = function (params, callback) {
  if (!params) {
    return callback(null,status.getStatus('input_missing'));
  }
    usersModel.setPasswordByEmail(params, function (err, result) {
    if (err) {
      return callback(null,status.getStatus('generic_fail'));
    }
    if (result === null) {
      return callback(null, status.getStatus('generic_fail'));
    }

      if (result.affectedRows) {
          var response = status.getStatus('success')
          response.data = {}
          response.data.email = params.email;
          response.data.password = params.password;
          return callback(null, response);
      }
      else {
          var response = status.getStatus('email_is_not_valid');
          return callback(null, response);
      }
  });
};


var forgetPassword = function (params, callback) {
  if (!params.email) {
    return callback(null,status.getStatus('input_missing'));
  }
  async.waterfall([
    function (doneCallback) {
      usersModel.getUserAndTokenByEmail(params.email, function (err, result) {
        if (err) {
          return doneCallback(err);
        }
        if(result === null){
          return callback(null,status.getStatus('email_is_not_valid'));
        }
        return doneCallback(null, result);
      });
    },
    function (user, doneCallback) {
        if (user.token_id && user.active_token){
          var tokenParams = {};
          tokenParams.token_id = user.token_id;
          tokenParams.increasetime = utilsService.addDays(new Date(), 1);
          authsModel.updateToken(tokenParams, function (err, result) {
            if (err) {
              return doneCallback(err);
            }
            return doneCallback(null,result);
          });
        }
        else{
          var tokenParams = {}
          tokenParams.token = uuid.v4().replace(/\-/g, '') + uuid.v4().replace(/\-/g, '');
          tokenParams.userId=user.user_id;
          tokenParams.expiry = utilsService.addDays(new Date(), 1);
          tokenParams.active = 1;
          tokenParams.context = 'forget';
          authsModel.createTokenByUserId(tokenParams, function (err, result) {
            if (err) {
              return doneCallback(err);
            }
            return doneCallback(null,result);
          });
        }
    },
    function (token,doneCallback) {
      usersModel.getUserAndTokenByEmail(params.email, function (err, result) {
        if (err) {
          return doneCallback(err);
        }
        var emailParams = {};
        emailParams.msg = 'Please update password by link below '+config.host+'auths/signup?type=token&action=verify&token='+result.token;
        emailParams.recieverEmail = result.user_email;
        emailParams.subject = 'Update Password'
        emailService.sendEmail(emailParams,function(err,emailresult){
          if (err){
            callback(status.getStatus('generic_fail'));
          }
          return doneCallback(null,result);
        });
      });
    }

  ], function (err, result) {
    if (err) {
      return callback(err);
    }
    var response = status.getStatus('email_sent');
    response.data = {};
    response.data.user  = {};
    response.data.user.email = result.user_email;
    response.data.user.user_id = result.user_id;
    return callback(null,response);
  });
};

module.exports = {
  login: login,
  logout: logout,
  validateSession: validateSession,
  checkEmail:checkEmail,
  validateToken:validateToken,
  setPassword:setPassword,
  forgetPassword:forgetPassword,
};
