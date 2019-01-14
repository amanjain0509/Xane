'use strict';

var async = require('async');
var status = require('app/configs/status');
var usersModel = require('app/models/users');
var _ = require('lodash');
var utilsService = require('app/services/utils');
var config = require('app/configs/config');


// by Ashutosh
var createUser = function (params, callback) {
    if (!params) {
        return callback(status.getStatus('input_missing'));
    }
    async.waterfall([
        function(donecallback){
            usersModel.getUserByEmail(params.email,function(err,result){
                if(err){
                    return callback(err);
                }
                if(result){
                    return callback(status.getStatus('email_already_exists'));
                }
                return donecallback(null);
            });
        },
        function(donecallback){
            usersModel.checkForeignKey(params,function(err,result){
                if(err){
                    return callback(status.getStatus('foreign_key_does_not_exist'));
                }
                return donecallback(null);
            });
        },
        function(donecallback){
            usersModel.createUser(params,function(err,result){
                if(err){
                    return callback(status.getStatus('input_missing'));
                }
                return donecallback(null,result.insertId);
            });
        }
    ],function(err,result){
        if(err){
            return callback(status.getStatus('input_missing'));
        }
        var response = status.getStatus('success');
        response.data = {};
        response.data.id = result;
        return callback(null,response);
    });
};

var updateUser = function (params, callback) {
    if (!params) {
        return callback(status.getStatus('input_missing'));
    }
    async.waterfall([
        function(donecallback){
            usersModel.getUserByEmail(params.email,function(err,result){
                if(err){
                    return callback(err);
                }
                if(!result){
                    return donecallback(null);
                }
                if(result.user_id == params.userId){
                    return donecallback(null);
                }
                else if(result){
                    return callback(status.getStatus('email_already_exists'));
                }

            });
        },
        function(donecallback){
            usersModel.checkForeignKey(params,function(err,result){
                if(err){
                    return callback(status.getStatus('foreign_key_does_not_exist'));
                }
                return donecallback(null);
            });
        },
        function(donecallback){
            usersModel.updateUser(params,function(err,result){
                if(err){
                    return callback(status.getStatus('input_missing'));
                }
                return donecallback(null,result);
            });
        }
    ],function(err,result){
        if(err){
            return callback(status.getStatus('input_missing'));
        }
        var response = status.getStatus('success');
        response.data = {};
        return callback(null,response);
    });
};

var deleteUser = function (params, callback) {
    async.waterfall([
        function (doneCallback) {
            if (params.roleId !== 1) {
                return doneCallback(status.getStatus('user_is_not_admin'));
            } else {
                usersModel.deleteUser(params.userId, function (err, result) {
                    if (err) {
                        return doneCallback(err);
                    }
                    if (!result) {
                        return doneCallback(null, status.getStatus('user_missing'));
                    }
                    return doneCallback(null, status.getStatus('success'));
                })
            }
        }
    ], function (err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    })
};

var setCloudTokenByUserId = function (params, callback) {
    async.waterfall([
        function (doneCallback) {
            usersModel.setCloudTokenByUserId(params, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                return doneCallback(null, result.insertId);
            })
        },
        function (insertId, doneCallback) {
            var response = status.getStatus('success');
            response.data = {};
            response.data.cloudTokenInsertId = insertId;

            doneCallback(null, response);

        }
    ], function (err, result) {
        if (err) {
            return callback(err);
        }

        return callback(null, result);
    })
};

module.exports = {
    createUser: createUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
    setCloudTokenByUserId: setCloudTokenByUserId,
};
