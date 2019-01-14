'use strict';
var status = require('app/configs/status');
var usersService = require('app/services/users');
var async = require('async');

// by Ashutosh
var createUser = function(req, res, next) {  
    console.log(req.body);
    if (!req.body.company_id || !req.body.email ||!req.body.first_name ||!req.body.doj ) {
        return next(status.getStatus('input_missing'));
    }
    var userParams = {};
    userParams.roleId = 2;
    userParams.companyId = req.body.company_id;
    userParams.email = req.body.email;
    userParams.firstName =  req.body.first_name;
    userParams.join_date = req.body.doj;
    userParams.password = req.body.password ? req.body.password : 'password';
    userParams.managerId = req.body.manager_id ? parseInt(req.body.manager_id) : null;
    userParams.designationId = req.body.designation_id ? parseInt(req.body.designation_id): null; 
    userParams.departmentId = req.body.department_id ? parseInt(req.body.department_id) : null;
    userParams.cityId = req.body.city_id ? parseInt(req.body.city_id) : null;
    userParams.employeeId = req.body.employee_id ? req.body.employee_id : null;
    userParams.lastName = req.body.last_name ? req.body.last_name: '';
    userParams.phone = req.body.phone ? req.body.phone : null;
    usersService.createUser(userParams, function (err, result) {
        if (err) {
            return next(err);
        }
        return res.json(result);
    });
};



// by Ashutosh
var updateUser = function (req, res, next) {
    console.log(req.body);
    if (!req.body.user_id || !req.body.company_id || !req.body.email  ||!req.body.first_name ||!req.body.doj ) {
        return next(status.getStatus('input_missing'));
    }

    var userParams = {};
    userParams.roleId = 2;
    userParams.userId = req.body.user_id;
    userParams.companyId = req.body.company_id;
    userParams.email = req.body.email;
    userParams.firstName =  req.body.first_name;
    userParams.join_date = req.body.doj;
    userParams.managerId = req.body.manager_id ? parseInt(req.body.manager_id) : null;
    userParams.designationId = req.body.designation_id ? parseInt(req.body.designation_id): null; 
    userParams.departmentId = req.body.department_id ? parseInt(req.body.department_id) : null;
    userParams.cityId = req.body.city_id ? parseInt(req.body.city_id) : null;
    userParams.employeeId = req.body.employee_id ? req.body.employee_id : null;
    userParams.lastName = req.body.last_name ? req.body.last_name: '';
    userParams.phone = req.body.phone ? req.body.phone : null;
    userParams.active = req.body.active ? req.body.active: 1;
    usersService.updateUser(userParams, function (err, result) {
        if (err) {
            return next(err);
        }
        return res.json(result);
    });
  };

var deleteUser = function (req, res, next) {
    if (!req.body.userId) {
        return next(status.getStatus('input_missing'));
    }
    var params = {};
    params.userId = parseInt(req.body.userId);
    params.roleId = req._user.roleId;
    usersService.deleteUser(params, function (err, result) {
        if (err) {
            return next(err);
        }

        return res.json(result);
    })

};

var setCloudTokenByUserId = function (req, res, next) {
    if (!req.body.registeredToken) {
        return next(status.getStatus('input_missing'));
    }
    var params = {};
    params.userId = req._user.id;
    params.registeredToken = req.body.registeredToken;
    usersService.setCloudTokenByUserId(params, function (err, result) {
        if (err) {
            return next(err);
        }

        return res.json(result);
    })
};

module.exports = {
    createUser: createUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
    setCloudTokenByUserId: setCloudTokenByUserId,
};
