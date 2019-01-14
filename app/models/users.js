'use strict';

var squel = require('squel');

var config = require('app/configs/config');
var utilsService = require('app/services/utils');
var crypto = require('crypto');
var async = require('async');

var _hash = function (password) {
  return crypto.createHash('md5').update(password).digest('hex');
};

var getCompanyNameByUserId = function (userid, callback) {
  var getCompanyNameByUserIdQuery = (squel.select()
    .field('c.company','company_name')
    .field('c.id','companyid')
    .from('companies','c')
    .where('id in ?',squel.select().field('company_id').from('users').where('id = ?', userid))
    ).toString();
    config.mysqlConnection.query(getCompanyNameByUserIdQuery, function (err, result) {
      if (err) {
        return callback(err);
      }
      if (!result || result.length === 0) {
        return callback(null, null);
      }
      return callback(null, utilsService.sanitizeSqlResult(result[0]));
    });
};

var getUserById = function (userId, callback) {
  var getUserByIdQuery = (squel.select()
    .field('u.id')
    .field('concat(u.first_name," ", u.last_name)','fullName')
    .field('u.phone')
    .field('u.email')
    .field('u.gender')
    .field('r.id', 'role_id')
    .field('r.role')
    .field('c.id', 'company_id')
    .field('c.company')
    .field('u.join_date')
    .field('d.designation','designation')
    .field('u.active')
    .from('users', 'u')
    .join('roles', 'r', 'r.id = u.role_id')
    .join('companies', 'c', 'c.id = u.company_id')
    .join('designations', 'd', 'd.id = u.designation_id')
    .where('u.id = ?', userId)
  ).toString();
  config.mysqlConnection.query(getUserByIdQuery, function (err, result) {
    if (err) {
      return callback(err);
    }

    if (!result || result.length === 0) {
      return callback(null, null);
    }

    return callback(null, utilsService.sanitizeSqlResult(result[0]));
  });
};

var getUserByEmail = function (email, callback) {
  var getUserByEmailQuery = (squel.select()
    .field('u.id','user_id')
    .field('concat(u.first_name," ", u.last_name)','fullName')
    .field('u.phone')
    .field('u.email','user_email')
    .field('u.gender')
    .field('r.id', 'role_id')
    .field('r.role')
    .field('c.id', 'company_id')
    .field('c.company')
    .field('u.join_date')
    .field('d.designation','designation')
    .field('u.active')
    .field('ut.id','token_id')
    .field('ut.token','token')
    .field('ut.active','active_token')
    .from('users', 'u')
    .join('roles', 'r', 'r.id = u.role_id')
    .join('companies', 'c', 'c.id = u.company_id')
    .join('designations', 'd', 'd.id = u.designation_id')
    .left_join('users_tokens','ut','ut.user_id = u.id and ut.context = "signup"')
    .where('u.email = ?', email)
    .where('u.user_deleted = false')
    .order('ut.created_at',false)
    .limit('1')
  ).toString();
  config.mysqlConnection.query(getUserByEmailQuery, function (err, result) {
    if (err) {
      return callback(err);
    }

    if (!result || result.length === 0) {
      return callback(null, null);
    }

    return callback(null, utilsService.sanitizeSqlResult(result[0]));
  });
};

var getUserAndTokenByEmail = function (email, callback) {
  var getUserByEmailQuery = (squel.select()
    .field('u.id','user_id')
    .field('concat(u.first_name," ", u.last_name)','fullName')
    .field('u.phone')
    .field('u.email','user_email')
    .field('u.gender')
    .field('r.id', 'role_id')
    .field('r.role')
    .field('c.id', 'company_id')
    .field('c.company')
    .field('u.join_date')
    .field('d.designation','designation')
    .field('u.active')
    .field('ut.id','token_id')
    .field('ut.token','token')
    .field('ut.active','active_token')
    .from('users', 'u')
    .join('roles', 'r', 'r.id = u.role_id')
    .join('companies', 'c', 'c.id = u.company_id')
    .join('designations', 'd', 'd.id = u.designation_id')
    .left_join('users_tokens','ut','ut.user_id = u.id and ut.context = "forget"')
    .where('u.email = ?', email)
    .where('u.user_deleted = false')
    .order('ut.created_at',false)
    .limit('1')
  ).toString();
  config.mysqlConnection.query(getUserByEmailQuery, function (err, result) {
    if (err) {
      return callback(err);
    }

    if (!result || result.length === 0) {
      return callback(null, null);
    }

    return callback(null, utilsService.sanitizeSqlResult(result[0]));
  });
};

var setPasswordByEmail = function (params, callback) {
  var setPasswordByEmailQuery = (squel.update()
    .table("users")
    .set("password", _hash(params.password))
    .set("active", 1))
    .where('email = ?', params.email)
  .toString()
  config.mysqlConnection.query(setPasswordByEmailQuery, function (err, result) {
    if (err) {
      return callback(err);
    }

    if (!result || result.length === 0) {
      return callback(null, null);
    }
    return callback(null, utilsService.sanitizeSqlResult(result));
  });
};


var checkForeignKey = function(params,callback){
  async.parallel([
    function(donecallback){
      if(!params.designationId){
        return donecallback(null);
      }
      var getDesignationQuery = (squel.select()
      .field('id')
      .from('designations')
      .where('id = ?',parseInt(params.designationId))
      ).toString();
      config.mysqlConnection.query(getDesignationQuery,function(err,result){
        if(err || result.length === 0){
          return callback(err);
        }
        return donecallback(null,result);
      })
    },
    function(donecallback){
      if(!params.departmentId){
        return donecallback(null);
      }
      var getDepartmentQuery = (squel.select()
      .field('id')
      .from('departments')
      .where('id = ?',parseInt(params.departmentId))
      ).toString();
      config.mysqlConnection.query(getDepartmentQuery,function(err,result){
        if(err || result.length === 0){
          return callback(err);
        }
        return donecallback(null,result);
      })
    },
    function(donecallback){
      if(!params.cityId){
        return donecallback(null);
      }
      var getCityQuery = (squel.select()
      .field('id')
      .from('designations')
      .where('id = ?',parseInt(params.cityId))
      ).toString();
      config.mysqlConnection.query(getCityQuery,function(err,result){
        if(err || result.length === 0){
          return callback(err);
        }
        return donecallback(null,result);
      })
    },
    function(donecallback){
      if(!params.managerId){
        return donecallback(null);
      }
      var getManagerQuery = (squel.select()
      .field('id')
      .from('users')
      .where('id = ?',parseInt(params.managerId))
      .where('company_id = ?',params.companyId)
      ).toString();
      config.mysqlConnection.query(getManagerQuery,function(err,result){
        if(err || result.length === 0){
          return callback(err);
        }
        return donecallback(null,result);
      })
    },
  ],function(err,result){
    if(err){
      return callback(err);
    }
    return callback(null);
  })
};


var updateUser = function(params,callback){
  async.waterfall([
    function(donecallback){
      var updateUserQuery = (squel.update()
        .table('users')
        .set('role_id',parseInt(params.roleId))
        .set('designation_id',params.designationId)
        .set('department_id',params.departmentId)
        .set('city_id',params.cityId)
        .set('company_id',params.companyId)
        .set('employee_id',params.employeeId)
        .set('first_name',params.firstName)
        .set('last_name',params.lastName)
        .set('phone',params.phone)
        .set('email',params.email)
        .set('join_date',params.join_date)
        .set('active',params.active)
        .where('id=?',params.userId)
      ).toString();
      config.mysqlConnection.query(updateUserQuery,function(err,result){
        if(err){
          return callback(err);
        }
        return donecallback(null);
      });
    },
    function(donecallback){
      var checkIfusreExistsInUserHierarchy = (squel.select()
        .field('id')
        .from('user_hierarchy')
        .where('user_id = ?',params.userId)
      ).toString();
      config.mysqlConnection.query(checkIfusreExistsInUserHierarchy,function(err,result){
        if(err){
          return callback(err);
        }
        if(!result || result.length === 0){
          return donecallback(null,null);
        }
        return donecallback(null,utilsService.sanitizeSqlResult(result));
      });
    },
    function(uh,donecallback){
      if(uh){
        var userHierarchyQuery = (squel.update()
          .table('user_hierarchy')
          .set('superior_user_id',params.managerId)
          .where('user_id = ?',params.userId)
        ).toString();
      }
      else{
        var userHierarchyQuery = (squel.insert()
          .into('user_hierarchy')
          .set('superior_user_id',params.managerId)
          .set('user_id',params.userId)
        ).toString();
      }
      config.mysqlConnection.query(userHierarchyQuery,function(err,result){
        if(err){
          return callback(err);
        }
        return donecallback(null,utilsService.sanitizeSqlResult(result));
      });
    }
  ],function(err,result){
    if(err){
      return callback(err);
    }
    return callback(null,result[0])
  });
}


var createUser = function(params,callback){
  console.log(params);
  async.waterfall([
    function(donecallback){
      var createUserQuery = (squel.insert()
        .into('users')
        .set('role_id',params.roleId)
        .set('designation_id',params.designationId)
        .set('department_id',params.departmentId)
        .set('city_id',params.cityId)
        .set('company_id',params.companyId)
        .set('employee_id',params.employeeId)
        .set('first_name',params.firstName)
        .set('last_name',params.lastName)
        .set('phone',params.phone)
        .set('email',params.email)
        .set('password',_hash(params.password))
        .set('join_date',params.join_date)
      ).toString();
      config.mysqlConnection.query(createUserQuery,function(err,result){
        console.log(err,result);
        if(err){
          return callback(err);
        }
        return donecallback(null,utilsService.sanitizeSqlResult(result));
      });
    },
    function(user,donecallback){
      var createUserHierarchy = (squel.insert()
        .into('user_hierarchy')
        .set('user_id',user.insertId)
        .set('superior_user_id',params.managerId)
      ).toString();
      config.mysqlConnection.query(createUserHierarchy,function(err,result){
        if(err){
          return callback(err);
        }
        return donecallback(null,user);
      });
    }
  ],function(err,result){
    if(err){
      return callback(err);
    }
    return callback(null,result);
  });
};

let deleteUser = function (userId, callback) {
   let deleteUserByUserIdQuery = (squel.update()
       .table('users')
       .set('user_deleted', 1)
       .where('id = ?', userId)
   ).toString();

   config.mysqlConnection.query(deleteUserByUserIdQuery, function (err, result) {
       if (err) {
         return callback(err);
       }
       if (!result || result.length === 0) {
         return callback(null, null);
       }
       return callback(null, result.affectedRows);
   })
};

var setCloudTokenByUserId = function(params, callback) {
  var setCloudTokenByUserIdQuery = (squel.useFlavour('mysql').insert()
      .into('user_cloud_tokens')
      .set('user_id', params.userId)
      .set('cloud_registered_token', params.registeredToken)
      .onDupUpdate('cloud_registered_token', params.registeredToken)
  ).toString();
  config.mysqlConnection.query(setCloudTokenByUserIdQuery, function (err, result) {
      if (err) {
        return callback(err);
      }
      if (!result || result.affectedRows === 0) {
        return callback(null, null);
      }
      return callback(null, utilsService.sanitizeSqlResult(result));
  })
};

/*
Get Registered Cloud Token by user id
Params: userId
Output: registeredToken for FCM
* */

var getRegisteredCloudTokenByUserId = function(userId, callback) {
  var getRegisteredCloudTokenByUserIdQuery = (squel.select()
      .field('uct.cloud_registered_token', 'registeredToken')
      .field('u.company_id','company_id')
      .from('user_cloud_tokens','uct')
      .join('users','u','u.id = uct.user_id')
      .where('uct.user_id = ?', userId)
  ).toString();

  config.mysqlConnection.query(getRegisteredCloudTokenByUserIdQuery, function (err, result) {
      if (err) {
        return callback(err);
      }
      if (!result || result.length === 0) {
        return callback(null, null);
      }
      return callback(null, utilsService.sanitizeSqlResult(result[0]));
  })
};


var getAdminIdByCompanyId = function(companyId,callback){
  var getAdminIdByCompanyIdQuery = (squel.select()
      .field('u.id','adminId')
      .from('users','u')
      .where('u.company_id = ?', companyId)
      .where('u.role_id = 1')
  ).toString();

  config.mysqlConnection.query(getAdminIdByCompanyIdQuery, function (err, result) {
      if (err) {
        return callback(err);
      }
      if (!result || result.length === 0) {
        return callback(null, []);
      }
      return callback(null, utilsService.sanitizeSqlResult(result));
  })
}
module.exports = {
  getUserById: getUserById,
  getCompanyNameByUserId:getCompanyNameByUserId,
  getUserByEmail:getUserByEmail,
  setPasswordByEmail:setPasswordByEmail,
  getUserAndTokenByEmail:getUserAndTokenByEmail,
  checkForeignKey: checkForeignKey,
  createUser: createUser,
  updateUser:updateUser,
  deleteUser: deleteUser,
  setCloudTokenByUserId: setCloudTokenByUserId,
  getRegisteredCloudTokenByUserId:getRegisteredCloudTokenByUserId,
  getAdminIdByCompanyId:getAdminIdByCompanyId,
};
