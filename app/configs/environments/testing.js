'use strict';

var mysql = require('mysql');

var mysqlConnectionString = {
    host: 'xane-development.cwwqesjeggcm.ap-south-1.rds.amazonaws.com',
    user: 'xane',
    password: 'dev.xane.ai',
    database: 'xane_test',
    port: 3306,
    multipleStatements: true                //ADDED!
};

var mysqlConnection = mysql.createConnection(mysqlConnectionString);

var MORGAN_LOG_PATH = 'app/logs';

var host = `http://dev.xane.ai/ `;

module.exports = {
    mysqlConnection: mysqlConnection,
    MORGAN_LOG_PATH: MORGAN_LOG_PATH,
    host: host,
};