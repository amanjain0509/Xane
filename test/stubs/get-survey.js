ss = require('app/services/surveys');

ss.getSurveyById({
  userId: 2,
  surveyId: 1
}, (e, r) => {
  console.log(e, JSON.stringify(r));
});