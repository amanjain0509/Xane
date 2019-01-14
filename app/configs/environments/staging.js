'use strict';

var mysql = require('mysql');
var admin = require('firebase-admin');

var serviceAccount = require('app/configs/firebase/xane-stage-firebase-adminsdk-n2zcm-6234b6de73');

var mysqlConnectionString = {
  host: 'xane-development.cwwqesjeggcm.ap-south-1.rds.amazonaws.com',
  user: 'xane',
  password: 'dev.xane.ai',
  database: 'xane_stage',
  port: 3306
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://xane-stage.firebaseio.com'
});

var database = admin.database();
var messaging = admin.messaging();

var mysqlConnection = mysql.createConnection(mysqlConnectionString);

var MORGAN_LOG_PATH = 'app/logs';

var host = 'http://stage.xane.ai/';
var weblinkHostName = 'http://stage.web.xane.ai/'

module.exports = {
  mysqlConnection: mysqlConnection,
  MORGAN_LOG_PATH: MORGAN_LOG_PATH,
  host: host,
  weblinkHostName:weblinkHostName,
  firebaseDatabase: database,
  firebaseMessaging: messaging
};
