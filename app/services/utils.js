'use strict';

var _ = require('lodash');

var addDays = function (date, numberOfDays) {
  return new Date(date.setDate(date.getDate() + numberOfDays));
};

var sanitizeSqlResult = function (result) {
  return JSON.parse(JSON.stringify(result));
};

var sortJsonKeys = function (object) {
  var sorted = {};
  var temp = [];
  var key;

  for (key in object) {
    if (object.hasOwnProperty(key)) {
      temp.push(key);
    }
  };

  temp.sort();

  for (key = 0; key < temp.length; key++) {
    sorted[temp[key]] = object[temp[key]];
  }

  return sorted;
};

module.exports = {
  addDays: addDays,
  sanitizeSqlResult: sanitizeSqlResult
};