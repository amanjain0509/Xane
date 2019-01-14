'use strict';

var mysql = require('mysql');
var admin = require('firebase-admin');

var serviceAccount = require('app/configs/firebase/xane-prod-firebase-adminsdk-c8ont-7c8410d088');

var mysqlConnectionString = {
  host: 'xane.cwwqesjeggcm.ap-south-1.rds.amazonaws.com',
  user: 'xane',
  password: 'prod.xane.ai',
  database: 'xane',
  port: 3306
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://xane-prod.firebaseio.com'
});

var database = admin.database();
var messaging = admin.messaging();

var mysqlConnection = mysql.createConnection(mysqlConnectionString);

var MORGAN_LOG_PATH = 'app/logs';

var host = `http://api.xane.ai/`;
var weblinkHostName = 'http://web.xane.ai/'

module.exports = {
  mysqlConnection: mysqlConnection,
  MORGAN_LOG_PATH: MORGAN_LOG_PATH,
  host:host,
  weblinkHostName:weblinkHostName,
  firebaseDatabase: database,
  firebaseMessaging: messaging
};
