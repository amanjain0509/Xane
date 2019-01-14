'use strict';

var squel = require('squel');
var crypto = require('crypto');
var async = require('async');

var config = require('app/configs/config');
var status = require('app/configs/status');

var utilsService = require('app/services/utils');

var _hash = function (password) {
  return crypto.createHash('md5').update(password).digest('hex');
};

var validateCredentials = function (params, callback) {
  if (!params.email || (!params.password && !params.passwordHash)) {
    return callback(status.getStatus('input_missing'));
  }

  if (params.password) {
    params.passwordHash = _hash(params.password);
  }

  var validateCredentialsQuery = (squel.select()
    .field('id')
    .from('users')
    .where('email = ?', params.email)
    .where('password = ?', params.passwordHash)
    .where('user_deleted = false')
    .order('id', false)
    .limit('1')
  ).toString();

  config.mysqlConnection.query(validateCredentialsQuery, function (err, result) {
    if (err) {
      return callback(err);
    }

    if (!result || result.length === 0) {
      return callback(null, null);
    } else {
      return callback(null, result[0].id);
    }
  });
};

var createSession = function (params, callback) {
  if (!params.userId || !params.token || !params.originId || !params.version || !params.expiry) {
    return callback(status.getStatus('input_missing'));
  }

  var createSessionQuery = (squel.insert()
    .into('sessions')
    .set('user_id', params.userId)
    .set('token', params.token)
    .set('origin_id', params.originId)
    .set('version', params.version)
    .set('expiry', params.expiry.toISOString())
    .set('active', 1)
  ).toString();

  config.mysqlConnection.query(createSessionQuery, function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result.insertId);
  });
};

var getOriginById = function (originId, callback) {
  var validateOriginVersionQuery = (squel.select()
    .field('id', 'origin_id')
    .field('deprecated_version')
    .from('origins')
    .where('id = ?', originId)
  ).toString();

  config.mysqlConnection.query(validateOriginVersionQuery, function (err, result) {
    if (err) {
      return callback(err);
    }

    if (!result || result.length === 0) {
      return callback(null, null);
    }

    return callback(null, utilsService.sanitizeSqlResult(result[0]));
  });
};

var getSessionByToken = function (token, callback) {
  var getSessionByTokenQuery = (squel.select()
    .field('id')
    .field('user_id')
    .field('token')
    .field('origin_id')
    .field('version')
    .field('expiry')
    .field('active')
    .from('sessions')
    .where('token = ?', token)
  ).toString();

  config.mysqlConnection.query(getSessionByTokenQuery, function (err, result) {
    if (err) {
      return callback(err);
    }

    if (!result || result.length === 0) {
      return callback(null, null);
    }

    return callback(null, utilsService.sanitizeSqlResult(result[0]));
  });
};

var deactivateSessionById = function (sessionId, callback) {
  var deactivateSessionByIdQuery = (squel.update()
    .table('sessions')
    .set('active', 0)
    .set('updated_at', new Date().toISOString())
    .where('id = ?', sessionId)
    .where('active = 1')
  ).toString();

  config.mysqlConnection.query(deactivateSessionByIdQuery, function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, true);
  });
};

var deactivateSessionByToken = function (token, callback) {
  async.waterfall([
    function (doneCallback) {
      getSessionByToken(token, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        return doneCallback(null, result);
      });
    },

    function (session, doneCallback) {
      if (!session) {
        return doneCallback(status.getStatus('authn_fail'));
      }

      deactivateSessionById(session.id, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        return doneCallback(null, session.id);
      });
    }
  ], function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  });
};

var updateSession = function (params, callback) {
  if (!params.sessionId) {
    return callback(status.getStatus('input_missing'));
  }

  var updateSessionQuery = (squel.update()
    .table('sessions')
    .set('updated_at', new Date().toISOString())
  );

  params.expiry ? updateSessionQuery.expiry = new Date(params.expiry).toISOString() : null;
  params.hasOwnProperty('active') ? updateSessionQuery.active = params.active : null;
  params.version ? updateSessionQuery.version = params.version : null;

  config.mysqlConnection.query(updateSessionQuery.toString(), function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, true);
  });
};

var deactivateExpiredActiveSessionsByUserId = function (userId, callback) {
  async.waterfall([
    function (doneCallback) {
      var getExpiredActiveSessionsByUserIdQuery = (squel.select()
        .field('id')
        .from('sessions')
        .where('user_id = ?', userId)
        .where('active = 1')
        .where('expiry <= now()')
      ).toString();

      config.mysqlConnection.query(getExpiredActiveSessionsByUserIdQuery, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        if (!result || result.length) {
          return doneCallback(null, []);
        }

        var sessionIds = [];
        result.forEach(function (r) {
          sessionIds.push(r.id);
        });

        return doneCallback(null, sessionIds);
      });
    },

    function (sessionIds, doneCallback) {
      if (sessionIds.length === 0) {
        return doneCallback(null, true);
      }

      async.each(sessionIds, function (sessionId, cb) {
        var updateParams = {};
        updateParams.sessionId = sessionId;
        updateParams.active = 0;

        updateSession(updateParams, function (err, result) {
          if (err) {
            return cb(err);
          }

          return cb(null);
        });
      }, function (err) {
        if (err) {
          return doneCallback(err);
        }

        return doneCallback(null, true);
      });
    }
  ], function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  });
};


var createTokenByUserId = function (tokenParams, callback) {
  var createTokenByUserIdQuery = (squel.insert()
    .into('users_tokens')
    .set('user_id', tokenParams.userId) 
    .set('token', tokenParams.token)
    .set('expiry', tokenParams.expiry.toISOString())
    .set('active',tokenParams.active)
    .set('context',tokenParams.context)
  ).toString();
  config.mysqlConnection.query(createTokenByUserIdQuery, function (err, result) {
    if (err) {
      return callback(err);
    }
    return callback(null, result);
  });
};


var updateToken = function (tokenParams, callback) {
  var updateTokenQuery = (squel.update()
    .table('users_tokens')
    .set('expiry', tokenParams.increasetime.toISOString())
    .set('active',1)
    .where('id = ?',tokenParams.token_id)
  ).toString();
  config.mysqlConnection.query(updateTokenQuery, function (err, result) {
    if (err) {
      return callback(err);
    }
    return callback(null, result);
  });
};


var getTokenDetail = function (token, callback) {
  var getTokenDetailQuery = (squel.select()
    .field('u.id','user_id')
    .field('concat(u.first_name," ", u.last_name)','fullName')
    .field('u.phone')
    .field('u.email','user_email')
    .field('u.gender')
    .field('u.role_id', 'role_id')
    .field('c.id', 'company_id')
    .field('c.company')
    .field('u.join_date')
    .field('d.designation','designation')
    .field('u.active')
    .field('ut.id','token_id')
    .field('ut.expiry','token_expiry')
    .field('ut.active','token_active')
    .from('users_tokens', 'ut')
    .join('users', 'u', 'u.id = ut.user_id')
    .join('companies', 'c', 'c.id = u.company_id')
    .join('designations', 'd', 'd.id = u.designation_id')
    .where('ut.token = ?', token)
  ).toString();
  config.mysqlConnection.query(getTokenDetailQuery, function (err, result) {
    if (err) {
      return callback(err);
    }

    if (!result || result.length === 0) {
      return callback(null, null);
    }
    
    return callback(null, utilsService.sanitizeSqlResult(result[0]));
  });
};


var deactivateToken = function (tokenParams, callback) {
  var deactivateTokenQuery = (squel.update()
    .table('users_tokens')
    .set('active',0)
    .where('id = ?',tokenParams.token_id)
  ).toString();
  config.mysqlConnection.query(deactivateTokenQuery, function (err, result) {
    if (err) {
      return callback(err);
    }
    return callback(null, result);
  });
};

module.exports = {
  validateCredentials: validateCredentials,
  createSession: createSession,
  getOriginById: getOriginById,
  getSessionByToken: getSessionByToken,
  deactivateSessionByToken: deactivateSessionByToken,
  updateSession: updateSession,
  deactivateExpiredActiveSessionsByUserId: deactivateExpiredActiveSessionsByUserId,
  createTokenByUserId:createTokenByUserId,
  getTokenDetail:getTokenDetail,
  updateToken:updateToken,
  deactivateToken:deactivateToken,
};