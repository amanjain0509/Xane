'use strict';

var status = require('app/configs/status');

var surveysService = require('app/services/surveys');

var placeholder = function () {};

var getSurvey = function (req, res, next) {
  if (!req.params.survey_id) {
    return next(status.getStatus('input_missing'));
  }

  var surveyParams = {};
  surveyParams.surveyId = parseInt(req.params.survey_id);
  surveyParams.userId = req._user.id;

  surveysService.getSurvey(surveyParams, function (err, result) {
    if (err) {
      return next(err);
    }

    return res.json(result);
  });
};

var createUserAnswer = function (req, res, next) {
  if (!req.params.survey_id || !req.body.question_id || (!req.body.answer_id && !req.body.answer)) {
    return next(status.getStatus('input_missing'));
  }
 
  var answerParams = {};
  answerParams.userId = req._user.id;
  answerParams.questionId = parseInt(req.body.question_id);

  req.body.answer ? answerParams.answer = req.body.answer : null;
  req.body.answer_id ? answerParams.answerId = parseInt(req.body.answer_id) : null;
  req.body.private ? answerParams.private = req.body.private : null;
  surveysService.createUserAnswer(answerParams, function (err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};

var getActiveSurveys = function (req, res, next) {
  surveysService.getActiveSurveysByUserId(req._user.id, function (err, result) {
    if (err) {
      return next(err);
    }

    return res.json(result);
  });
};


var getVoluntaryFeedback = function (req, res, next) {
  
  var params = {};
  params.userId = parseInt(req._user.id);

  surveysService.getVoluntaryFeedback(params, function (err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};


var createVoluntaryFeedback = function (req, res, next) {
  if (!req.body.feedback) {
    return next(status.getStatus('input_missing'));
  }
  var params = {};
  params.userId = parseInt(req._user.id);
  params.feedback = req.body.feedback;
  req.body.feedback_token ? params.feedback_token = req.body.feedback_token : null;
  surveysService.createVoluntaryFeedback(params, function (err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};


var voluntryFeedbackAction = function (req, res, next) {
  if (!req.params.feedback_token) {
    return next(status.getStatus('input_missing'));
  }
  var params = {};
  params.userId = req._user.id;
  params.feedback_token = req.params.feedback_token;

  surveysService.voluntryFeedbackAction(params, function (err, result) {
    if (err) {
      return next(err);
    }
    return res.json(result);
  });
};


var changeStatusToSeen = function(req, res, next){
  if (!req.params.token) {
    return next(status.getStatus('input_missing'));
  }
  var params = {};
  params.token = req.params.token;

  surveysService.changeStatusToSeen(params, function (err, result) {
      if (err) {
          return next(err);
      }
      return res.json(result);
  });
}

module.exports = {
  // createSurvey: createSurvey, 
  // getSurvey: getSurvey,
  // createQuestion: createQuestion,
  // createQuestionRouting; createQuestionRouting,
  createSurvey: placeholder,
  getSurvey: getSurvey,
  createQuestion: placeholder,
  createQuestionRouting: placeholder,
  createUserAnswer: createUserAnswer,
  getActiveSurveys: getActiveSurveys,
  getVoluntaryFeedback:getVoluntaryFeedback,
  createVoluntaryFeedback:createVoluntaryFeedback,
  voluntryFeedbackAction:voluntryFeedbackAction,
  changeStatusToSeen:changeStatusToSeen,
};