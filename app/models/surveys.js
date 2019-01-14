'use strict';

var squel = require('squel');
var async = require('async');
var _ = require('lodash');

var config = require('app/configs/config');
var status = require('app/configs/status');

var utilsService = require('app/services/utils');

var getSurveyById = function (surveyId, callback) {
    async.parallel([
        function (doneCallback) {
            var getSurveyQuery = (squel.select()
                .field('s.id')
                .field('st.survey_type')
                .field('c.company')
                .field('first_question_id')
                .from('surveys', 's')
                .join('survey_types', 'st', 'st.id = s.survey_type_id')
                .join('company_targets', 'ct', 'ct.id = s.company_target_id')
                .join('companies', 'c', 'c.id = ct.company_id')
                .where('s.id = ?', surveyId)
            ).toString();

            config.mysqlConnection.query(getSurveyQuery, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                if (!result || result.length === 0) {
                    return doneCallback(status.getStatus('survey_missing'));
                }

                return doneCallback(null, utilsService.sanitizeSqlResult(result[0]));
            });
        },

        function (doneCallback) {
            var getSurveyQuestionsQuery = (squel.select()
                .field('q.survey_id')
                .field('q.id')
                .field('q.question')
                .from('questions', 'q')
                .where('q.survey_id = ?', surveyId)
            ).toString();

            config.mysqlConnection.query(getSurveyQuestionsQuery, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                return doneCallback(null, utilsService.sanitizeSqlResult(result));
            });
        },

        function (doneCallback) {
            var getSurveyQuestionAnswersQuery = (squel.select()
                .field('q.survey_id')
                .field('q.id', 'question_id')
                .field('at.answer_type')
                .field('qa.id')
                .field('qa.sequence')
                .field('qa.answer')
                .from('questions', 'q')
                .join('answer_types', 'at', 'at.id = q.answer_type_id')
                .left_join('question_answers', 'qa', 'qa.question_id = q.id')
                .where('q.survey_id = ?', surveyId)
            ).toString();

            config.mysqlConnection.query(getSurveyQuestionAnswersQuery, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                return doneCallback(null, utilsService.sanitizeSqlResult(result));
            });
        },

        function (doneCallback) {
            var getSurveyQuestionRoutingsQuery = (squel.select()
                .field('qr.question_id')
                .field('qa.id')
                .field('qa.sequence')
                .field('qr.prequel_text')
                .field('qr.next_question_id')
                .from('question_routings', 'qr')
                .join('questions', 'q', 'q.id = qr.question_id')
                .left_join('question_answers', 'qa', 'qa.question_id = qr.question_id and qa.sequence = qr.answer_sequence')
                .where('q.survey_id = ?', surveyId)
            ).toString();

            config.mysqlConnection.query(getSurveyQuestionRoutingsQuery, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                return doneCallback(null, utilsService.sanitizeSqlResult(result));
            });
        }
    ], function (err, result) {
        if (err) {
            return callback(err);
        }

        return callback(null, collateSurveyQuestions(result[0], result[1], result[2], result[3]));
    });
};

var collateSurveyQuestions = function (survey, questions, questionAnswers, questionRoutings) {
    var _survey = {};
    _survey.id = survey.id;
    _survey.survey_type = survey.survey_type;
    _survey.company = survey.company;
    _survey.first_question_id = survey.first_question_id;
    _survey.questions = [];

    var qTemp1 = [];
    questions.forEach(function (question) {
        qTemp1.push(_.pick(question, ['id', 'question', 'answer_type']))
    });

    var _answers = [];
    questionAnswers.forEach(function (qa) {
        qa.prequel_text = _.find(questionRoutings, function (qr) {
            return (qr.question_id === qa.question_id && qr.sequence === qa.sequence);
        })['prequel_text'];

        if (qa.answer_type.toLowerCase() === 'objective') {
            qa.next_question_id = _.find(questionRoutings, function (qr) {
                return (qr.question_id === qa.question_id && qr.sequence === qa.sequence);
            })['next_question_id'];
            _answers.push(qa);
        } else if (qa.answer_type.toLowerCase() === 'subjective') {
            qa.next_question_id = _.find(questionRoutings, function (qr) {
                return (qr.question_id === qa.question_id);
            })['next_question_id'];
            _answers.push(qa);
        }
    });

    var qTemp2 = [];
    qTemp1.forEach(function (question) {
        var _answersTemp = _.filter(_answers, function (qa) {
            return qa.question_id === question.id;
        });

        question.answers = _.map(_answersTemp, function (x) {
            return _.pick(x, ['id', 'sequence', 'answer', 'prequel_text', 'next_question_id']);
        });

        qTemp2.push(question);
    });

    _survey.questions = qTemp2;
    return _survey;
};

var getSurveyIdByQuestionId = function (questionId, callback) {
    var getSurveyIdByQuestionIdQuery = (squel.select()
        .field('survey_id')
        .from('questions')
        .where('id = ?', questionId)
    ).toString();

    config.mysqlConnection.query(getSurveyIdByQuestionIdQuery, function (err, result) {
        if (err) {
            return callback(err);
        }

        if (!result || result.length === 0) {
            return callback(null, null);
        }

        return callback(null, result[0].survey_id);
    });
};

var getSurveyMetadataById = function (surveyId, callback) {
    var getSurveyMetadataByIdQuery = (squel.select()
        .field('ct.company_id')
        .field('s.survey_type_id')
        .field('sc.start')
        .field('sc.end')
        .field('sc.id', 'survey_cycle_id')
        .from('surveys', 's')
        .join('company_targets', 'ct', 'ct.id = s.company_target_id')
        .join('survey_cycles', 'sc', 'sc.survey_id = s.id')
        .where('sc.active = 1 and s.id = ?', surveyId)
    ).toString();

    config.mysqlConnection.query(getSurveyMetadataByIdQuery, function (err, result) {
        if (err) {
            return callback(err);
        }

        if (!result || result.length === 0) {
            return callback(null, null);
        }

        return callback(null, utilsService.sanitizeSqlResult(result[0]));
    });
};

var getUserQuestionAnswer = function (params, callback) {
    if (!params.userId || !params.questionId) {
        return callback(status.getStatus('input_missing'));
    }

    var getUserQuestionAnswerQuery = (squel.select()
        .field('id')
        .field('question_id')
        .field('answer_sequence')
        .from('user_answers')
        .where('user_id = ?', params.userId)
        .where('question_id = ?', params.questionId)
    ).toString();

    config.mysqlConnection.query(getUserQuestionAnswerQuery, function (err, result) {
        if (err) {
            return callback(err);
        }

        if (!result || result.length === 0) {
            return callback(null, null);
        }

        return callback(null, utilsService.sanitizeSqlResult(result[0]));
    });
};

var validateAnswer = function (params, callback) {
    if (!params.questionId) {
        return callback(status.getStatus('input_missing'));
    }

    var validateAnswerQuery = (squel.select()
        .field('q.id', 'question_id')
        .field('qa.id', 'question_answer_id')
        .field('at.answer_type')
        .from('questions', 'q')
        .join('answer_types', 'at', 'at.id = q.answer_type_id')
        .left_join('question_answers', 'qa', 'qa.question_id = q.id')
        .where('q.id = ?', params.questionId)
    ).toString();

    config.mysqlConnection.query(validateAnswerQuery, function (err, result) {
        if (err) {
            return callback(err);
        }

        if (!result || result.length === 0) {
            return callback(null, null);
        }

        if (result[0].answer_type.toLowerCase() === 'subjective') {
            return callback(null, true);
        } else {
            var response = false;
            result.forEach(function (r) {
                if (r.question_answer_id === params.answerId) {
                    response = true;
                }
            });

            return callback(null, response);
        }
    });
};

var getAnswerSequenceByQuestionAnswerId = function (answerId, callback) {
    var getAnswerSequenceByQuestionAnswerIdQuery = (squel.select()
        .field('sequence')
        .from('question_answers')
        .where('id = ?', answerId)
    ).toString();

    config.mysqlConnection.query(getAnswerSequenceByQuestionAnswerIdQuery, function (err, result) {
        if (err) {
            return callback(err);
        }

        if (!result || result.length === 0) {
            return callback(null, null);
        }

        return callback(null, result[0].sequence);
    });
};

var getNextQuestion = function (questionId, sequence, callback) {
    async.waterfall([
        function (doneCallback) {
            if (sequence === 0) {
                var getNextQuestionQuery = (squel.select()
                    .field('qr.next_question_id')
                    .from('question_routings', 'qr')
                    .where('qr.question_id = ?', questionId)
                ).toString();
            }
            else {
                var getNextQuestionQuery = (squel.select()
                    .field('qr.next_question_id')
                    .from('question_routings', 'qr')
                    .where('qr.question_id = ?', questionId)
                    .where('qr.answer_sequence = ?', sequence)
                ).toString();
            }

            config.mysqlConnection.query(getNextQuestionQuery, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                if (!result || result.length === 0) {
                    return doneCallback(null, null);
                }
                return doneCallback(null, result[0].next_question_id);     
            });
        },

        function (nextQuestionId, doneCallback) {
            if (nextQuestionId === null) {
                var Res = [];
                var res = {};
                res.next_question_id = null;
                res.question = null;
                res.id = null;
                res.answer = null;
                res.sequence = null;
                res.prequel_text = null;
                Res.push(res);
                return doneCallback(null, Res);
            }
            var getSurveyQuestionRoutingsQuery = (squel.select()
                .field('qr.question_id', 'next_question_id')
                .field('qr.prequel_text')
                .field('q.question')
                .field('qas.id')
                .field('qas.answer')
                .field('qas.sequence')
                .from('question_routings', 'qr')
                .join('questions', 'q', 'q.id = qr.question_id')
                .left_join('question_answers', 'qas', 'qas.question_id = qr.question_id and qas.sequence = qr.answer_sequence')
                .where('qr.question_id = ?', nextQuestionId)
            ).toString();

            config.mysqlConnection.query(getSurveyQuestionRoutingsQuery, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                return doneCallback(null, result);
            });
        }
    ], function (err, result) {
        if (err) {
            return callback(err);
        }

        return callback(null, result);
    });
};

/*var getNextQuestion = function (questionId, sequence, callback) {       //Added 
    if (sequence == 0) {
        var getNextQuestionQuery = (squel.select()
            .field('qr.next_question_id')
            .field('q.question')
            .field('qas.id')
            .field('qas.answer')
            .field('qas.sequence')
            .field('qrs.prequel_text')
            .from('question_routings', 'qr')
            .left_join('questions', 'q', 'q.id = qr.next_question_id')
            .left_join('question_answers', 'qa', 'qa.question_id = qr.question_id and qa.sequence = qr.answer_sequence')
            .left_join('question_answers', 'qas', 'qas.question_id = qr.next_question_id')
            .left_join('question_routings', 'qrs', 'qrs.question_id = qas.question_id and qrs.answer_sequence = qas.sequence')
            .where('qr.question_id = ?', questionId)
        ).toString();
    }
    else {
        var getNextQuestionQuery = (squel.select()
            .field('qr.next_question_id')
            .field('q.question')
            .field('qas.id')
            .field('qas.answer')
            .field('qas.sequence')
            .field('qrs.prequel_text')
            .from('question_routings', 'qr')
            .left_join('questions', 'q', 'q.id = qr.next_question_id')
            .left_join('question_answers', 'qa', 'qa.question_id = qr.question_id and qa.sequence = qr.answer_sequence')
            .left_join('question_answers', 'qas', 'qas.question_id = qr.next_question_id')
            .left_join('question_routings', 'qrs', 'qrs.question_id = qr.next_question_id')
            .where('qr.question_id = ?', questionId)
            .where('qr.answer_sequence = ?', sequence)
        ).toString();
    }

    config.mysqlConnection.query(getNextQuestionQuery, function (err, result) {
        if (err) {
            return callback(err);
        }

        if (!result || result.length === 0) {
            return callback(null, null);
        }
        return callback(null, result);
    });
};*/

var createUserAnswer = function (params, callback) {
    if (!params.userId || !params.questionId || (!params.answerId && !params.answer)) {
        return callback(status.getStatus('input_missing'));
    }
    async.waterfall([
        function (doneCallback) {
            getAnswerSequenceByQuestionAnswerId(params.answerId, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                return doneCallback(null, result);
            });
        },

        function (sequence, doneCallback) {
            var createUserAnswerQuery = (squel.insert()
                .into('user_answers')
                .set('user_id', params.userId)
                .set('question_id', params.questionId)
                .set('answer_sequence', sequence)
                .set('sentiment_id', params.sentimentId)
                .set('sentiment', params.score)
                .set('survey_cycles_id', params.surveyCyclesId)
            );
            params.answer ? createUserAnswerQuery.set('answer', params.answer) : null;
            params.private ? createUserAnswerQuery.set('private', params.private) : null;

            config.mysqlConnection.query(createUserAnswerQuery.toString(), function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                return doneCallback(null, result.insertId);
            });
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
            getApplicableUserCompanyTargetsByUserId(userId, function (err, result) {
                if (err) {
                    return doneCallback(err);
                }

                if (!result) {
                    return doneCallback(status.getStatus('generic_fail'));
                }

                return doneCallback(null, result);
            });
        },
        function (applicableUserCompanyTargets, doneCallback) {
            var getActiveSurveysByUserIdQuery = (squel.select()
                .field('distinct s.id')
                .from('surveys', 's')
                .join('company_targets', 'ct', 'ct.id = s.company_target_id')
                .join('survey_cycles', 'sc', 'sc.survey_id = s.id')
                .join('users', 'u', 'u.company_id = ct.company_id')
                .join('roles', 'r', 'r.id = u.role_id')
                .where(`r.role = 'employee' OR r.role = 'superadmin'`)
                .where('sc.start <= ?', new Date().toISOString())
                .where('sc.end >= ?', new Date().toISOString())
                .where('u.id = ?', userId)
            );
            if (applicableUserCompanyTargets.length !== 0) {
                getActiveSurveysByUserIdQuery.where('s.company_target_id in ?', applicableUserCompanyTargets);
            }
            config.mysqlConnection.query(getActiveSurveysByUserIdQuery.toString(), function (err, result) {
                if (err) {
                    return doneCallback(err);
                }
                if (!result || result.length === 0) {
                    return doneCallback(null, null);
                }

                var surveyIds = [];
                result.forEach(function (r) {
                    surveyIds.push(r.id);
                });

                return doneCallback(null, surveyIds);
            });
        }
    ], function (err, result) {
        if (err) {
            return callback(err);
        }

        return callback(null, result);
    });
};

var getAnsweredSurveyQuestionsByUser = function (params, callback) {
  if (!params.userId || !params.surveyId) {
    return callback(status.getStatus('input_missing'));
  }

  var getAnsweredSurveyQuestionsByUserQuery = (squel.select()
    .field('q.id', 'question_id')
    .field('q.question')
    .field('qa.id', 'answer_id')
    .field('ua.answer', 'subjective_answer')
    .field('ua.answer_sequence')
    .field('qa.answer')
    .field('ua.created_at')
    .from('user_answers', 'ua')
    .join('users', 'u', 'u.id = ua.user_id')
    .join('roles', 'r', 'r.id = u.role_id')
    .join('questions', 'q', 'q.id = ua.question_id')
    .join('surveys', 's', 's.id = q.survey_id')
    .left_join('question_answers', 'qa', 'qa.sequence = ua.answer_sequence and qa.question_id = ua.question_id')
    .where(`r.role = 'employee' OR r.role = 'superadmin' `)
    .where('u.id = ?', params.userId)
    .where('s.id = ?', params.surveyId)
  ).toString();

  config.mysqlConnection.query(getAnsweredSurveyQuestionsByUserQuery, function (err, result) {
    if (err) {
      return callback(err);
    }

    if (!result || result.length === 0) {
      return callback(null, null);
    }

    return callback(null, utilsService.sanitizeSqlResult(result));
  });
};

var getApplicableUserCompanyTargetsByUserId = function (userId, callback) {
  async.waterfall([
    function (doneCallback) {
      var getUserCompanyTargetsByUserIdQuery = (squel.select()
        .field('ct.id')
        .field('t.code')
        .field('ct.start')
        .field('ct.end')
        .field('u.unit')
        .field('sc.start','survey_start_date')
        .field('sc.end','survey_end_date')
        .field('us.join_date','join_date')
        .from('users', 'us')
        .join('companies', 'c', 'c.id = us.company_id')
        .join('company_targets', 'ct', 'ct.company_id = c.id')
        .join('surveys','s','s.company_target_id = ct.id')
        .join('survey_cycles','sc','sc.survey_id=s.id')
        .join('targets', 't', 't.id = ct.target_id')
        .join('units', 'u', 'u.id = ct.unit_id')
        .where('ct.active = 1 and sc.active = 1')
        .where('us.id = ?', userId)
        .where('sc.start <= now()')
        .where('sc.end >= now()')
      ).toString();
      config.mysqlConnection.query(getUserCompanyTargetsByUserIdQuery, function (err, result) {
        if (err) {
          return doneCallback(err);
        }
        if (!result || result.length === 0) {
          return doneCallback(null, null);
        }

        return doneCallback(null, utilsService.sanitizeSqlResult(result));
      });
    },

    function (userCompanyTargets, doneCallback) {
      var applicableUserCompanyTargets = [];
      async.each(userCompanyTargets, function (uct, cb) {
        if (uct.code === 'EMP_AGE' && uct.unit === 'days') {

          var employeeAge = Math.ceil((new Date(uct.survey_start_date) - new Date(uct.join_date))   / (1000 * 3600 * 24));

          if ((uct.start && uct.end && employeeAge >= uct.start && employeeAge <= uct.end) || (uct.start && !uct.end && employeeAge >= uct.start)) {
            applicableUserCompanyTargets.push(uct.id);
          }
          return cb(null);
        } else {
          return cb(status.getStatus('unsupported_feature'));
        }
      }, function (err) {
        if (err) {
          return doneCallback(err);
        }
        return doneCallback(null, applicableUserCompanyTargets);
      });
    }
  ], function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  });
};


var getEmployeeAgeDaysByUserId = function (userId, callback) {
    var getEmployeeAgeDaysByUserIdQuery = (squel.select()
        .field('datediff(date(convert_tz(now(), \'+00:00\', \'+05:30\')), date(convert_tz(join_date, \'+00:00\',\'+05:30\')))', 'days')
        .from('users')
        .where('id = ?', userId)
    ).toString();
    config.mysqlConnection.query(getEmployeeAgeDaysByUserIdQuery, function (err, result) {
        if (err) {
            return callback(err);
        }

        if (!result || result.length === 0 || !result[0].days) {
            return callback(null, null);
        }

        return callback(null, result[0].days);
    });
};

var getAnswerSequenceAndStepByAnswerId = function (answerId, callback) {
    var getAnswerSequenceAndStepByAnswerIdQuery = (squel.select()
        .field('qa.sequence', 'sequence')
        .field('q.steps', 'steps')
        .from('question_answers', 'qa')
        .join('questions', 'q', 'q.id = qa.question_id')
        .where('qa.id = ?', answerId)
    ).toString();

    config.mysqlConnection.query(getAnswerSequenceAndStepByAnswerIdQuery, function (err, result) {
        if (err) {
            return callback(err);
        }
        if (!result || result.length === 0) {
            return callback(null, null);
        }
        return callback(null, result);
    });
};


var createVoluntaryFeedback = function(params,callback){
    async.waterfall([
        function(doneCallback){
            var createVoluntaryFeedbackQuery = (squel.insert()
                .into('voluntary_feedback')
                .set('feedback_token',params.feedback_token)
                .set('user_id',params.userId)
                .set('feedback',params.feedback)
            ).toString();
            config.mysqlConnection.query(createVoluntaryFeedbackQuery,function(err,result){
                if(err){
                    return callback(err);
                }
                return doneCallback(null,utilsService.sanitizeSqlResult(result));
            });
        },
        function(feedback,doneCallback){
            var getTokenQuery = (squel.select()
                .field('feedback_token','token')
                .from('voluntary_feedback')
                .where('id = ?',feedback.insertId)
            ).toString();
            config.mysqlConnection.query(getTokenQuery,function(err,result){
                if(err){
                    return callback(err);
                }
                return doneCallback(null,utilsService.sanitizeSqlResult(result));
            });
        }
    ],function(err,result){
        // console.log(result);
        if(err){
            return callback(err);
        }
        return callback(null,result[0]);
    });
}
  
  
var getVoluntaryFeedback = function(params,callback){
    var getVoluntaryFeedbackQuery = (squel.select()
        .field('concat(u.first_name," ",u.last_name)','name')
        .field('vf.user_id','user_id')
        .field('vf.admin_id','admin_id')
        .field('vf.feedback','feedback')
        .field('vf.feedback_token','token')
        .field('vf.created_at','created_date')
        .field('vf.active','active')
        .field('vf.seen','seen')
        .from('users','u')
        .join('voluntary_feedback','vf','vf.user_id = u.id')
        .where('vf.user_id = ?',params.userId)  
        .order('vf.created_at')
    ).toString();
    config.mysqlConnection.query(getVoluntaryFeedbackQuery,function(err,result){
        if(err){
        return callback(err);
        }
        return callback(null, utilsService.sanitizeSqlResult(result));
    });
}


var voluntryFeedbackAction = function(params,callback){
    // var voluntryFeedbackActionQuery = (squel.update()
    //     .table('voluntary_feedback')
    //     .set('active' ,squel.select().field('active').from('voluntary_feedback').where('feedback_token = ?',params.feedback_token).where('user_id = ?',params.userId))
    //     .where('feedback_token = ?',params.feedback_token)
    //     .where('user_id = ?',params.userId)
    // ).toString();
    var voluntryFeedbackActionQuery = `update voluntary_feedback set active = !active where user_id = `+params.userId +` and feedback_token = '`+params.feedback_token+`'`;    
    config.mysqlConnection.query(voluntryFeedbackActionQuery,function(err,result){
        if(err){
            return callback(err);
        }
        return callback(null,utilsService.sanitizeSqlResult(result));
    });
}


var changeStatusToSeen = function(params,callback){
    var changeStatusToSeenQuery = (squel.update()
        .table('voluntary_feedback')
        .set('seen',true)
        .where('feedback_token = ?',params.token)
        .where('admin_id is null')
    ).toString();
    config.mysqlConnection.query(changeStatusToSeenQuery,function(err,result){
        if(err){
            return callback(err);
        }
        return callback(null,utilsService.sanitizeSqlResult(result));
    });
}


module.exports = {
    getSurveyById: getSurveyById,
    getSurveyIdByQuestionId: getSurveyIdByQuestionId,
    getSurveyMetadataById: getSurveyMetadataById,
    getUserQuestionAnswer: getUserQuestionAnswer,
    validateAnswer: validateAnswer,
    createUserAnswer: createUserAnswer,
    getNextQuestion: getNextQuestion,       //Added
    getActiveSurveysByUserId: getActiveSurveysByUserId,
    getAnsweredSurveyQuestionsByUser: getAnsweredSurveyQuestionsByUser,
    getAnswerSequenceAndStepByAnswerId: getAnswerSequenceAndStepByAnswerId,
    getApplicableUserCompanyTargetsByUserId: getApplicableUserCompanyTargetsByUserId,
    getVoluntaryFeedback:getVoluntaryFeedback,
    createVoluntaryFeedback:createVoluntaryFeedback,
    voluntryFeedbackAction:voluntryFeedbackAction,
    changeStatusToSeen:changeStatusToSeen,
};