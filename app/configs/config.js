'use strict';

var _ = require('lodash');
var defaults = require('app/configs/environments/defaults');
var envConfig = require(`app/configs/environments/${process.env.NODE_ENV}.js`);

module.exports = _.merge({}, defaults, envConfig);