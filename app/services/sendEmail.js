'use strict';

var nodemailer = require('nodemailer');

var sendEmail = function (params, callback) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'no-reply@xane.ai',
          pass: 'xane-1995-xane'
      
        },
        tls: {
            rejectUnauthorized: false
        }
      });
      
      var mailOptions = {
        from: 'no-reply@xane.ai',
        to: params.recieverEmail,
        subject: params.subject,
        text: params.msg
      };
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          return callback(error);
        } else {
          return callback(null,info.response);
        }
      });
  };

  module.exports = {
    sendEmail:sendEmail,
  };