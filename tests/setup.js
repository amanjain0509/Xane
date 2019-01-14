'use strict';
process.env.NODE_ENV = 'testing';

const async = require('async');
const fs = require('fs');

const config = require('app/configs/config');

const dbSetup = './docs/db/test_sql-init.sql';
const sqlGlobalDataSetup = './docs/db/test_dbSetup.sql';
const dbTeardown = './docs/db/test_dbTeardown.sql';

const globalDataSetup = './docs/db/test_dbSetup_dashboard.sql';

const setup = (callback) => {
    async.waterfall([
        (doneCallback) => {
            fs.readFile(dbSetup, (err, result) => {
                if (err) {
                    return doneCallback(err);
                }
                return doneCallback(null, result.toString());
            });
        },


        (initSql, doneCallback) => {
            config.mysqlConnection.query(initSql, (err, result) => {
                if (err) {
                    return doneCallback(err);
                }
                return doneCallback(null);
            });
        },

        (doneCallback) => {
            fs.readFile(sqlGlobalDataSetup, (err, result) => {
                if (err) {
                    return doneCallback(err);
                }
                return doneCallback(null, result.toString());
            })
        },

        (initData, doneCallback) => {
            config.mysqlConnection.query(initData, (err, result) => {
                if (err) {
                    return doneCallback(err);
                }
                return doneCallback(null);
            });
        }

    ], (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
};

const teardown = (callback) => {
    async.waterfall([
        (doneCallback) => {
            fs.readFile(dbTeardown, (err, result) => {
                if (err) {
                    return doneCallback(err);
                }
                return doneCallback(null, result.toString());
            });
        },

        (teardownSql, doneCallback) => {
            config.mysqlConnection.query(teardownSql, (err, result) => {
                if (err) {
                    return doneCallback(err);
                }
                return doneCallback(null, result);
            });
        }
    ], (err, result) => {
        if (err) {
            return callback(err);
        }

        return callback(null);
    });
};

const globalData = (callback) => {
    async.waterfall([

        (doneCallback) => {
            fs.readFile(globalDataSetup, (err, result) => {
                if (err) {
                    return doneCallback(err);
                }
                return doneCallback(null, result.toString());
            })
        },

        (initData, doneCallback) => {
            config.mysqlConnection.query(initData, (err, result) => {
                if (err) {
                    return doneCallback(err);
                }
                return doneCallback(null);
            });
        }

    ], (err, result) => {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
};

module.exports = {
    setup: setup,
    teardown: teardown,
    globalData: globalData
};