'use strict';

var async = require('async');

var status = require('app/configs/status');
var surveysModel = require('app/models/surveys');
var usersModel = require('app/models/users');
var dashboardModel = require('app/models/dashboard');
var _ = require('lodash');

var uuid = require('uuid');

var placeholder = function (params, callback) {

};

var createUserAnswer = function (params, callback) {
    if (!params.userId || !params.questionId) {
        return callback(status.getStatus('input_missing'));
    }

    async.waterfall([
        function (doneCallback) {
            surveysModel.getSurveyIdByQuestionId(params.questionId, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                if (!result) {
                    return doneCallback(status.getStatus('question_missing'));
                }

                return doneCallback(null, result);
            });
        },

        function (surveyId, doneCallback) {
            surveysModel.getSurveyMetadataById(surveyId, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                if (!result) {
                    return doneCallback(status.getStatus('survey_missing'));
                }

                return doneCallback(null, result);
            });
        },

        function (surveyMetadata, doneCallback) {
            usersModel.getUserById(params.userId, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                if (!result) {
                    return doneCallback(status.getStatus('user_missing'));
                }

                return doneCallback(null, surveyMetadata, result);
            });
        },

        function (surveyMetadata, user, doneCallback) {
            var validationParams = {};
            validationParams.questionId = params.questionId;
            params.answerId ? validationParams.answerId = params.answerId : null;

            surveysModel.validateAnswer(validationParams, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                return doneCallback(null, surveyMetadata, user, result);
            });
        },

        function (surveyMetadata, user, validAnswer, doneCallback) {
            var answerParams = {};
            answerParams.questionId = params.questionId;
            answerParams.userId = params.userId;
            params.answerId ? answerParams.answerId = params.answerId : null;
            params.answer ? answerParams.answer = params.answer : null;

            surveysModel.getUserQuestionAnswer(answerParams, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                if ((user.role === 'employee' || user.role === 'superadmin') && validAnswer && user.company_id === surveyMetadata.company_id && !result && (new Date() >= new Date(surveyMetadata.start)) && (new Date() <= new Date(surveyMetadata.end))) {
                    return doneCallback(null, surveyMetadata);
                } else {
                    return doneCallback(status.getStatus('user_answer_disallow'));
                }
            });
        },
        function (surveyMetadata, doneCallback) {      //
            surveysModel.getAnswerSequenceAndStepByAnswerId(params.answerId, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }
                var sentiment = {};
                var sentiment_data = JSON.parse(JSON.stringify(result));
                if (sentiment_data == null) {
                    sentiment.id = null;
                    sentiment.score = null
                    var sequence = 0;       //
                }
                else {
                    var sequence = sentiment_data[0].sequence;      //
                    var difference = 4 / (sentiment_data[0].steps - 1);
                    var score_1 = 1 + (sentiment_data[0].sequence - 1) * difference;
                    sentiment.score = 5 - (score_1 - 1);
                    sentiment.score = Number((sentiment.score).toFixed(3));
                    if (sentiment.score <= 2) sentiment.id = 1;
                    else if ((sentiment.score > 2) && (sentiment.score <= 3.5)) sentiment.id = 2;
                    else if (sentiment.score > 3.5) sentiment.id = 3;
                }
                doneCallback(null, sentiment, surveyMetadata, sequence);      //
                //doneCallback(null,sentiment,surveyMetadata);      
            });
        },
        function (sentiment, surveyMetadata, sequence, doneCallback) {
            var answerParams = {};
            answerParams.userId = params.userId;
            answerParams.sentimentId = sentiment.id;
            answerParams.score = sentiment.score;
            answerParams.questionId = params.questionId;
            answerParams.surveyCyclesId = surveyMetadata.survey_cycle_id;
            params.answerId ? answerParams.answerId = params.answerId : null;
            params.answer ? answerParams.answer = params.answer : null;
            params.private ? answerParams.private = params.private : null;
            surveysModel.createUserAnswer(answerParams, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                answerParams.user_answer_id = result;
                return doneCallback(null, answerParams, sequence);
            });
        },
        function (params, sequence, doneCallback) {                                                   //Added
            //console.log(params.questionId, sequence);
            surveysModel.getNextQuestion(params.questionId, sequence, function (err, result) {
                //console.log(result);
                if (err) {
                    return doneCallback(err);
                }
                if (!result) {
                    return doneCallback(status.getStatus('survey_missing'));
                }
                var response = status.getStatus('success');
                response.data = {};

                var nextQuestion = {};
                nextQuestion.question_id = result[0].next_question_id;
                nextQuestion.question = result[0].question;
                nextQuestion.answer = [];
                if (result.length === 1) {
                    response.data.next_question = nextQuestion;
                    var options = {};
                    options.id = null;
                    options.answer = null;
                    options.sequence = null;
                    options.prequel_text = result[0].prequel_text;
                    nextQuestion.answer.push(options);
                    return doneCallback(null, response);
                }

                else {
                    for (var i = 0; i < result.length; i++) {
                        var options = {};
                        options.id = result[i].id;
                        options.answer = result[i].answer;
                        options.sequence = result[i].sequence;
                        options.prequel_text = result[i].prequel_text;
                        nextQuestion.answer.push(options);
                    }
                    response.data.next_question = nextQuestion;
                    return doneCallback(null, response);
                }

            });
        }
    ], function (err, result) {
        if (err) {
            return callback(err);
        }

        return callback(null, result);
    });
};

var getSurvey = function (params, callback) {
    if (!params.userId || !params.surveyId) {
        return callback(status.getStatus('input_missing'));
    }

    async.waterfall([
        function (doneCallback) {
            usersModel.getUserById(params.userId, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                if (!result) {
                    return doneCallback(status.getStatus('user_missing'));
                }

                return doneCallback(null, result);
            });
        },

        function (user, doneCallback) {
            surveysModel.getSurveyMetadataById(params.surveyId, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                if (!result) {
                    return doneCallback(status.getStatus('authr_fail'));
                }

                if (result.company_id === user.company_id) {
                    return doneCallback(null);
                } else {
                    return doneCallback(status.getStatus('authr_fail'));
                }
            });
        },

        function (doneCallback) {
            surveysModel.getSurveyById(params.surveyId, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                return doneCallback(null, result);
            });
        },

        function (survey, doneCallback) {
            var response = status.getStatus('success');
            response.data = {};
            response.data.survey = survey;

            return doneCallback(null, response);
        }
    ], function (err, result) {
        if (err) {
            return callback(err);
        }

        return callback(null, result);
    });
};


var getActiveSurveysByUserId = function (userId, callback) {
  async.waterfall([
    function (doneCallback) {
      surveysModel.getActiveSurveysByUserId(userId, function (err, result) {
        if (err) {
          return doneCallback(err);
        }

        return doneCallback(null, result);
      });
    },

    function (surveyIds, doneCallback) {
      var surveys = [];

      if (!surveyIds) {
        return doneCallback(null, surveys);
      }

      async.each(surveyIds, function (surveyId, cb) {
        var _survey = {};
        _survey.id = surveyId;

        var answeredQuestionsParams = {};
        answeredQuestionsParams.userId = userId;
        answeredQuestionsParams.surveyId = surveyId;

        surveysModel.getAnsweredSurveyQuestionsByUser(answeredQuestionsParams, function (err, result) {
          if (err) {
            return cb(err);
          }

          if (!result) {
            _survey.answered_questions = [];
          } else {
            result.forEach((row) => {
              if (row.answer === null) {
                row.answer = row.subjective_answer;
              }
              delete row.subjective_answer;
            });
            _survey.answered_questions = result;
          }

          surveys.push(_survey);
          return cb(null);
        });
      }, function (err) {
        if (err) {
          return doneCallback(err);
        }

        return doneCallback(null, surveys);
      });
    },

    function (surveys, doneCallback) {
      var response = status.getStatus('success');
      response.data = {};
      response.data.surveys = surveys;

      return doneCallback(null, response);
    }
  ], function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  });
};


var getVoluntaryFeedback = function (params, callback) {
    if (!params) {
        return callback(status.getStatus('input_missing'));
    }
    surveysModel.getVoluntaryFeedback(params, function (err, result) {
        if(err){
            return callback(err);
        }
        var _tokenWiseData = [];
        result.forEach(function(r){
            var _index = _.findIndex(_tokenWiseData,function(o){return o.token == r.token});
            var _feedback = {};
            if (_index >= 0){
                _feedback.feedback = r.feedback;
                _feedback.date = r.created_date;
                _feedback.admin_id = r.admin_id;
                _tokenWiseData[_index].seen = r.seen;
                _tokenWiseData[_index].conversation.push(_feedback); 
            }
            else{
                var conv = {};
                _feedback.name = r.name;
                _feedback.seen = r.seen;
                _feedback.user_id = r.user_id;
                _feedback.token = r.token;
                _feedback.active = r.active;
                _feedback.conversation = [];
                conv.feedback = r.feedback;
                conv.date = r.created_date;
                conv.admin_id = r.admin_id;
                _feedback.conversation.push(conv);
                _tokenWiseData.push(_feedback);
            }
        });
        var response = status.getStatus('success');
        response.data = _tokenWiseData;
        return callback(null,response);
        // var response = status.getStatus('success');
        // response.data = result;
        // return callback(null,response);
    });
};
  
  
var createVoluntaryFeedback = function (params, callback) {
    if (!params) {
        return callback(status.getStatus('input_missing'));
    }
    if(!params.feedback_token){
        params.feedback_token = uuid.v4().replace(/\-/g, '');
    }
    async.waterfall([
        function(doneCallback){
            surveysModel.createVoluntaryFeedback(params, function (err, result) {
                if(err){
                    return callback(err);
                }
                if(!result){
                    return callback(null,status.getStatus('user_is_not_admin'));
                }
                return doneCallback(null,result);
            });
        },
        function(feedbackParams,doneCallback){
            usersModel.getCompanyNameByUserId(params.userId,function(err,result){
                if(err){
                    return callback(err);
                }
                return doneCallback(null,feedbackParams,result.companyid);
            });
        },
        function(feedbackParams,company_id,doneCallback){
            usersModel.getAdminIdByCompanyId(company_id,function(err,result){
                if(err){
                    return callback(err);
                }
                return doneCallback(null,feedbackParams,company_id,result);
            });
        },
        function(feedbackParams,company_id,adminId,doneCallback){
            adminId.forEach(function(a){
                var notificationParams = {};
                notificationParams.message = params.feedback;
                notificationParams.user_id = a.adminId;
                notificationParams.company_id = company_id;
                dashboardModel.pushNotificationToRTDIndividualUser(notificationParams,function(err,result){
                    if(err){
                        return callback(err);
                    }
                });
            });
            return doneCallback(null,feedbackParams);
        }
    ],function(err,result){
        if(err){
            return callback(err);
        }
        var response = status.getStatus('success');
        response.data ={};
        response.data.token = result.token; 
        return callback(null,response);
    });
};


var voluntryFeedbackAction = function(params,callback){
    if (!params) {
        return callback(status.getStatus('input_missing'));
    }
    surveysModel.voluntryFeedbackAction(params, function (err, result) {
        if(err){
            return callback(err);
        }

        var response = status.getStatus('success');
        response.data ={};
        return callback(null,response);
    });
}
  

var changeStatusToSeen = function(params,callback){
    surveysModel.changeStatusToSeen(params, function (err, result) {
        if (err) {
        return callback(err);
        }
        var response = status.getStatus('success');
        return callback(null, response);
    });
}


module.exports = {
  // createSurvey: createSurvey,
  // getSurvey: getSurvey,
  // createQuestion: createQuestion,
  // createQuestionRouting: createQuestionRouting,
  getSurvey: getSurvey,
  createSurvey: placeholder,
  createQuestion: placeholder,
  createQuestionRouting: placeholder,
  createUserAnswer: createUserAnswer,
  getActiveSurveysByUserId: getActiveSurveysByUserId,
  getVoluntaryFeedback:getVoluntaryFeedback,
  createVoluntaryFeedback:createVoluntaryFeedback,
  voluntryFeedbackAction:voluntryFeedbackAction,
  changeStatusToSeen:changeStatusToSeen,
};


