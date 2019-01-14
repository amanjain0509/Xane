'use strict';

var getStatus = function (code) {
  var status;

  switch (code) {
  case 'success':
    status = {
      code: code,
      error: false,
      message: 'Successful'
    };
    break;

  case 'email_is_not_valid':
    status = {
      code: code,
      error: true,
      message: 'Email is not valid'
    };
    break;
  case 'token_already_used':
    status = {
      code: code,
      error: true,
      message: 'This token has been used already'
    };
    break;
  
  case 'foreign_key_does_not_exist':
    status = {
      code: code,
      error: true,
      message: 'This foreign key does not exist in database'
    };
    break;  
    
  case 'invalid_token':
    status = {
      code: code,
      error: true,
      message: 'token_is_not_valid'
    };
    break;

  case 'email_sent':
    status = {
      code: code,
      error: false,
      message: 'Email has been sent to users mail'
    };
    break;

  case 'enter_password':
    status = {
      code: code,
      error: false,
      message: 'User can enter password'
    };
    break;

  case 'user_is_not_admin':
    status = {
      code: code,
      error: true,
      message: 'User is not admin'
    };
    break;

  case 'input_missing':
    status = {
      code: code,
      error: true,
      message: 'Missing mandatory input fields'
    };
    break;

  case 'headers_missing':
    status = {
      code: code,
      error: true,
      message: 'Missing headers'
    };
    break;

  case 'company_missing':
    status = {
      code: code,
      error: true,
      message: 'Company missing'
    };
    break;

  case 'authn_fail':
    status = {
      code: code,
      error: true,
      message: 'Sorry that Password/Username isn\'t right'
    };
    break;

  case 'authr_fail':
    status = {
      code: code,
      error: true,
      message: 'Authorisation failed'
    };
    break;

  case 'unsupported_feature':
    status = {
      code: code,
      error: true,
      message: 'Unsupported feature'
    };
    break;

  case 'email_already_exists':
  status = {
    code: code,
    error: true,
    message: 'this email already exists'
  };
  break;

  case 'role_missing':
    status = {
      code: code,
      error: true,
      message: 'User role not found'
    };
    break;

  case 'user_missing':
    status = {
      code: code,
      error: true,
      message: 'User not found'
    };
    break;

  case 'no_results':
    status = {
      code: code,
      error: true,
      message: 'No results found'
    };
    break;

  case 'origin_version_fail':
    status = {
      code: code,
      error: true,
      message: 'Invalid or deprecated app version.'
    };
    break;

  case 'user_inactive':
    status = {
      code: code,
      error: true,
      message: 'User inactive. Please contact customer support for reactivation.'
    };
    break;

  case 'survey_missing':
    status = {
      code: code,
      error: true,
      message: 'Survey not found.'
    };
    break;

  case 'question_missing':
    status = {
      code: code,
      error: true,
      message: 'Question not found.'
    };
    break;

  case 'question_answer_missing':
    status = {
      code: code,
      error: true,
      message: 'Answer not found.'
    };
    break;

  case 'user_answer_disallow':
    status = {
      code: code,
      error: true,
      message: 'Not allowed to answer'
    };
    break;

  case 'orgchart_missing':
    status = {
      code: code,
      error: true,
      message: 'Org chart missing'
    };
    break;

  default:
    status = {
      code: 'generic_fail',
      error: true,
      message: 'Generic failure: Something went wrong'
    };
    break;
  }

  return status;
};

module.exports = {
  getStatus: getStatus
};
