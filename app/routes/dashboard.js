var express = require('express');
var router = express.Router();

var controller = require('app/controllers/dashboard');

router.get('/:companyId([0-9]+)/getResponsiveUsers', controller.getResponsiveUsers)
router.get('/:companyId([0-9]+)/users', controller.getUserDetails);
router.post('/selective_user_notification', controller.getSelectiveUserNotification);

////////////////////////////////////////////////////

router.get('/:companyId([0-9]+)/orgchart', controller.getorgchart);
router.get('/:companyId([0-9]+)/question_and_bucket_sentiment', controller.getQuestionAndBucketSentimentByCompanyId);
router.get('/:userId([0-9]+)/question_response', controller.getQuestionResponseByUserId);
router.get('/:companyId([0-9]+)/feedback_recieved', controller.getRecievedFeedbackForAllUsersByCompanyId);
router.get('/:companyId([0-9]+)/get_user_stage_fill_surveys', controller.getUsersStageFillSurveys);
router.get('/:companyId([0-9]+)/get_user_stage_download_app', controller.getUsersStageDownloadApp);
router.get('/:companyId([0-9]+)/questions_category_table', controller.categoryWiseQuestionSentiment);
router.get('/:companyId([0-9]+)/org_survey_analytics', controller.orgSurveyAnalytics);
router.get('/:companyId([0-9]+)/bucket_category_sentiment', controller.getBucketCategorySentiment); //Bucket:Theme_Sentiment
router.get('/:companyId([0-9]+)/notifications', controller.getAllPushedNotifications);
router.post('/push_notification', controller.pushNotificationForAll);
router.get('/:companyId([0-9]+)/genuinity_analysis', controller.getUserFeedbackGenuinity); //Not to be shown on dashboard... Analysis of Genuinity of Feedback
router.get('/:companyId([0-9]+)/category_keywords', controller.getCategoryKeywords); //For JIVA using ML model in Python
router.get('/:companyId([0-9]+)/progress_bar', controller.getProgressBar); //Progress bar


router.get('/:companyId([0-9]+)/voluntary_feedback', controller.getVoluntaryFeedback); // showing voluntry feedback on dashboard
router.post('/voluntary_feedback', controller.createVoluntaryFeedback); // submitting voluntary feedback via Admin
router.put('/:token/change_status_to_seen', controller.changeStatusToSeen); // for changing VF status to seen from unseen for admin

router.get('/:companyId([0-9]+)/master_data', controller.getMasterData);
router.get('/:companyId([0-9]+)/master_question_filter', controller.masterQuestionFilter); //question table for 4 level filter
router.get('/:questionId([0-9]+)/get_question_responses_on_filter', controller.getQuestionResponsesOnFilter);
router.get('/:questionId([0-9]+)/get_followup_question', controller.getFollowupQuestion);









module.exports = router;