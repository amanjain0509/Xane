'use strict';

var mysql = require('mysql');
var admin = require('firebase-admin');

var serviceAccount = require('app/configs/firebase/xane-service-firebase-adminsdk-mum4g-c16de7b484');

var mysqlConnectionString = {
  host: 'xane-development.cwwqesjeggcm.ap-south-1.rds.amazonaws.com',
  user: 'xane',
  password: 'dev.xane.ai',
  database: 'xane_dev',
  port: 3306
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://xane-service.firebaseio.com'
});

var database = admin.database();
var messaging = admin.messaging();

var mysqlConnection = mysql.createConnection(mysqlConnectionString);

var MORGAN_LOG_PATH = 'app/logs';

var host = `http://dev.xane.ai/`;
var weblinkHostName = 'http://dev.web.xane.ai/';

module.exports = {
  mysqlConnection: mysqlConnection,
  MORGAN_LOG_PATH: MORGAN_LOG_PATH,
  host: host,
  weblinkHostName: weblinkHostName,
  firebaseDatabase: database,
  firebaseMessaging: messaging
};
