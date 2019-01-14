'use strict';

var express = require('express');
var router = express.Router();

var controller = require('app/controllers/surveys');

router.post('/', controller.createSurvey);
router.get('/active', controller.getActiveSurveys);
router.get('/:survey_id([0-9]+)', controller.getSurvey);
router.post('/:survey_id([0-9]+)/questions', controller.createQuestion);
router.post('/:survey_id([0-9]+)/questions/:question_id/route', controller.createQuestionRouting);
router.post('/:survey_id([0-9]+)/answers', controller.createUserAnswer);

router.get('/voluntary_feedback',controller.getVoluntaryFeedback);  // showing voluntry feedback on to user
router.post('/voluntary_feedback',controller.createVoluntaryFeedback);  // submitting voluntary feedback via User
router.put('/:feedback_token/voluntry_feedback_action',controller.voluntryFeedbackAction);   // resolve-unresolve voluntry feedback 
router.put('/:token/change_status_to_seen',controller.changeStatusToSeen); // for changing VF status to seen from unseen for admin
module.exports = router;